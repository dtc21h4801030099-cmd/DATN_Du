import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

from app.config import settings
from app.models.chat import ChatHistory
from app.models.faq import FAQ
from app.models.major import Major
from app.models.university import University

SYSTEM_PROMPT = """Bạn là trợ lý tư vấn tuyển sinh đại học của hệ thống DUTA (thuộc Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên).

=== QUY TẮC ƯU TIÊN CAO NHẤT ===
Phần "CÂU HỎI THƯỜNG GẶP (FAQ)" trong dữ liệu bên dưới là nội dung do quản trị viên hệ thống cung cấp và có độ ưu tiên CAO NHẤT.
- Khi câu hỏi của người dùng khớp hoặc tương tự với bất kỳ câu hỏi nào trong FAQ, BẮT BUỘC trả lời đúng theo nội dung FAQ đó, không được từ chối hay thay thế bằng câu trả lời khác.
- Quy tắc từ chối câu hỏi off-topic KHÔNG áp dụng khi đã có FAQ tương ứng.

=== PHẠM VI TƯ VẤN (trong phạm vi — PHẢI trả lời) ===
Các loại câu hỏi sau ĐỀU thuộc phạm vi tư vấn tuyển sinh, KHÔNG được từ chối:
- Thông tin ngành học, trường đại học, điểm chuẩn, chỉ tiêu tuyển sinh
- Định hướng ngành học dựa trên năng lực, môn học giỏi, sở thích (ví dụ: "giỏi toán nên học ngành gì", "thích công nghệ nên chọn trường nào")
- Tư vấn chọn ngành dựa trên điểm thi, khối thi, tổ hợp môn
- Triển vọng nghề nghiệp, cơ hội việc làm của các ngành học
- Quy trình, thủ tục đăng ký xét tuyển đại học
- So sánh các ngành học, trường đại học
- Bất kỳ câu hỏi nào liên quan đến việc lựa chọn con đường học tập sau cấp 3

=== QUY TẮC CHUNG ===
1. Ưu tiên 1: Trả lời theo FAQ nếu câu hỏi khớp với FAQ.
2. Ưu tiên 2: Trả lời dựa vào dữ liệu ngành học, trường đại học bên dưới nếu câu hỏi liên quan đến tuyển sinh.
3. Ưu tiên 3: Nếu thông tin không có trong dữ liệu, dùng kiến thức chung về tuyển sinh Việt Nam và ghi chú "đây là thông tin tham khảo chung, bạn nên xác nhận lại với nhà trường".
4. Ưu tiên 4: Chỉ từ chối khi câu hỏi hoàn toàn không liên quan đến học tập, ngành nghề, hay tuyển sinh (ví dụ: nấu ăn, thể thao, giải trí...).
5. KHÔNG tạo ra hình ảnh, âm thanh hay nội dung đa phương tiện.
6. LUÔN trả lời bằng văn bản tiếng Việt, thân thiện và đầy đủ thông tin.

=== DỮ LIỆU HỆ THỐNG ===
{context}
"""

OFF_TOPIC_REPLY = (
    "Xin lỗi, tôi chỉ có thể tư vấn về tuyển sinh đại học, ngành học và điểm chuẩn. "
    "Bạn có câu hỏi gì về tuyển sinh không? Ví dụ: ngành nào phù hợp với năng lực của bạn, "
    "điểm chuẩn các trường, hoặc định hướng nghề nghiệp."
)


def _build_context(db: Session) -> str:
    universities = db.query(University).all()
    majors = db.query(Major).all()
    faqs = db.query(FAQ).order_by(FAQ.created_at.desc()).all()

    uni_map = {u.id: u.name for u in universities}

    lines = []

    # FAQ đặt ĐẦU TIÊN — ưu tiên cao nhất
    if faqs:
        lines.append("=== CÂU HỎI THƯỜNG GẶP DO ADMIN CẤU HÌNH (ƯU TIÊN CAO NHẤT) ===")
        lines.append("Lưu ý: Khi người dùng hỏi câu hỏi khớp với bất kỳ mục FAQ nào dưới đây, PHẢI trả lời đúng theo câu trả lời FAQ, không được từ chối.")
        for i, f in enumerate(faqs, 1):
            lines.append(f"FAQ {i}:")
            lines.append(f"  Câu hỏi: {f.question}")
            lines.append(f"  Câu trả lời: {f.answer}")
        lines.append("")

    lines.append("=== DANH SÁCH TRƯỜNG ĐẠI HỌC ===")
    for u in universities:
        lines.append(f"- {u.name}" + (f" | {u.address}" if u.address else ""))

    lines.append("\n=== DANH SÁCH NGÀNH HỌC ===")
    for m in majors:
        uni_name = uni_map.get(m.university_id, "")
        parts = [f"- {m.name}"]
        if m.code:
            parts.append(f"Mã: {m.code}")
        if m.subject_group:
            parts.append(f"Khối: {m.subject_group}")
        if m.benchmark is not None:
            parts.append(f"Điểm chuẩn: {m.benchmark}")
        if m.quota:
            parts.append(f"Chỉ tiêu: {m.quota}")
        if uni_name:
            parts.append(f"Trường: {uni_name}")
        lines.append(" | ".join(parts))

    return "\n".join(lines)


def _find_faq_match(db: Session, message: str) -> str | None:
    """Tìm FAQ khớp với câu hỏi (so sánh không phân biệt hoa/thường, bỏ khoảng trắng thừa)."""
    normalized = message.strip().lower()
    faqs = db.query(FAQ).all()
    for faq in faqs:
        if faq.question.strip().lower() == normalized:
            return faq.answer
    return None


def chat_with_ai(db: Session, user_id: int, message: str) -> ChatHistory:
    # Khớp chính xác FAQ trước — không cần gọi AI
    faq_answer = _find_faq_match(db, message)
    if faq_answer:
        answer = faq_answer
    else:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        context = _build_context(db)
        system = SYSTEM_PROMPT.format(context=context)
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                config=types.GenerateContentConfig(
                    system_instruction=system,
                    max_output_tokens=2048,
                    thinking_config=types.ThinkingConfig(thinking_budget=0),
                ),
                contents=message,
            )
            try:
                answer = response.text or OFF_TOPIC_REPLY
            except ValueError:
                answer = OFF_TOPIC_REPLY
        except Exception as e:
            logger.error("Gemini API error [%s]: %s", type(e).__name__, e)
            answer = "Xin lỗi, hệ thống tạm thời gặp sự cố kỹ thuật. Vui lòng thử lại sau."

    record = ChatHistory(
        user_id=user_id,
        message=message,
        response=answer,
        created_at=datetime.now(timezone.utc),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
