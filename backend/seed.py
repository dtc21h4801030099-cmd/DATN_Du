"""
Chạy một lần để khởi tạo dữ liệu mẫu:
    cd backend
    python seed.py
"""
import sys
import os
import random
from datetime import datetime, date, timedelta, timezone

sys.path.append(os.path.dirname(__file__))
sys.stdout.reconfigure(encoding="utf-8")

from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.university import University
from app.models.major import Major
from app.models.post import Post
from app.models.chat import ChatHistory
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── Admin ──────────────────────────────────────────────────────────────────
if not db.query(User).filter(User.email == "admin@gmail.com").first():
    admin = User(
        full_name="Quản trị viên",
        email="admin@gmail.com",
        password_hash=hash_password("Admin@123"),
        role="admin",
    )
    db.add(admin)
    db.commit()
    print("✅ Tạo admin: admin@gmail.com / Admin@123")
else:
    print("⚠️  Admin đã tồn tại, bỏ qua.")

# ── Trường đại học (20 trường) ─────────────────────────────────────────────
universities_data = [
    {"name": "Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên",
     "address": "Phường Tân Thịnh, TP. Thái Nguyên", "website": "https://ictu.edu.vn",
     "description": "Trường đào tạo chuyên ngành CNTT hàng đầu khu vực Đông Bắc."},
    {"name": "Trường ĐH Bách khoa Hà Nội",
     "address": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội", "website": "https://hust.edu.vn",
     "description": "Một trong những trường kỹ thuật hàng đầu Việt Nam."},
    {"name": "Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội",
     "address": "144 Xuân Thủy, Cầu Giấy, Hà Nội", "website": "https://uet.vnu.edu.vn",
     "description": "Trường đào tạo công nghệ trực thuộc ĐH Quốc gia Hà Nội."},
    {"name": "Trường ĐH FPT",
     "address": "Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội", "website": "https://daihoc.fpt.edu.vn",
     "description": "Trường đại học tư thục định hướng doanh nghiệp FPT."},
    {"name": "Trường ĐH Kinh tế Quốc dân",
     "address": "207 Giải Phóng, Hai Bà Trưng, Hà Nội", "website": "https://neu.edu.vn",
     "description": "Trường kinh tế hàng đầu Việt Nam, đào tạo cử nhân và thạc sĩ kinh tế."},
    {"name": "Trường ĐH Ngoại thương Hà Nội",
     "address": "91 Chùa Láng, Đống Đa, Hà Nội", "website": "https://ftu.edu.vn",
     "description": "Đào tạo chuyên sâu về thương mại quốc tế, kinh tế đối ngoại."},
    {"name": "Trường ĐH Y Hà Nội",
     "address": "1 Tôn Thất Tùng, Đống Đa, Hà Nội", "website": "https://hmu.edu.vn",
     "description": "Trường y khoa lớn nhất miền Bắc, đào tạo bác sĩ, dược sĩ, điều dưỡng."},
    {"name": "Trường ĐH Sư phạm Hà Nội",
     "address": "136 Xuân Thủy, Cầu Giấy, Hà Nội", "website": "https://hnue.edu.vn",
     "description": "Trường đào tạo giáo viên lớn nhất Việt Nam."},
    {"name": "Trường ĐH Luật Hà Nội",
     "address": "87 Nguyễn Chí Thanh, Đống Đa, Hà Nội", "website": "https://hlu.edu.vn",
     "description": "Trường đào tạo luật hàng đầu, cung cấp nhân lực pháp lý cho cả nước."},
    {"name": "Trường ĐH Xây dựng Hà Nội",
     "address": "55 Giải Phóng, Hai Bà Trưng, Hà Nội", "website": "https://nuce.edu.vn",
     "description": "Đào tạo kỹ sư xây dựng, kiến trúc và kỹ thuật hạ tầng."},
    {"name": "Trường ĐH Bách khoa TP.HCM",
     "address": "268 Lý Thường Kiệt, Quận 10, TP.HCM", "website": "https://hcmut.edu.vn",
     "description": "Trường kỹ thuật hàng đầu miền Nam, trực thuộc ĐH Quốc gia TP.HCM."},
    {"name": "Trường ĐH Khoa học Tự nhiên TP.HCM",
     "address": "227 Nguyễn Văn Cừ, Quận 5, TP.HCM", "website": "https://hcmus.edu.vn",
     "description": "Đào tạo các ngành khoa học tự nhiên và công nghệ tại TP.HCM."},
    {"name": "Trường ĐH Kinh tế TP.HCM",
     "address": "59C Nguyễn Đình Chiểu, Quận 3, TP.HCM", "website": "https://ueh.edu.vn",
     "description": "Trường kinh tế lớn nhất phía Nam, đào tạo kinh doanh, tài chính, kế toán."},
    {"name": "Trường ĐH Sư phạm TP.HCM",
     "address": "280 An Dương Vương, Quận 5, TP.HCM", "website": "https://hcmue.edu.vn",
     "description": "Đào tạo giáo viên và cán bộ quản lý giáo dục tại phía Nam."},
    {"name": "Trường ĐH Nông Lâm TP.HCM",
     "address": "Khu phố 6, Linh Trung, Thủ Đức, TP.HCM", "website": "https://hcmuaf.edu.vn",
     "description": "Đào tạo nông nghiệp, lâm nghiệp, thủy sản và công nghệ sinh học."},
    {"name": "Trường ĐH Đà Nẵng",
     "address": "41 Lê Duẩn, Hải Châu, Đà Nẵng", "website": "https://ud.edu.vn",
     "description": "Trung tâm đào tạo đại học lớn nhất miền Trung."},
    {"name": "Trường ĐH Huế",
     "address": "03 Lê Lợi, TP. Huế, Thừa Thiên Huế", "website": "https://hueuni.edu.vn",
     "description": "Đại học vùng miền Trung, đào tạo đa ngành chất lượng cao."},
    {"name": "Trường ĐH Cần Thơ",
     "address": "3/2 Xuân Khánh, Ninh Kiều, TP. Cần Thơ", "website": "https://ctu.edu.vn",
     "description": "Trung tâm đào tạo và nghiên cứu lớn nhất vùng Đồng bằng sông Cửu Long."},
    {"name": "Trường ĐH Vinh",
     "address": "182 Lê Duẩn, TP. Vinh, Nghệ An", "website": "https://vinhuni.edu.vn",
     "description": "Trường đại học đa ngành tại khu vực Bắc Trung Bộ."},
    {"name": "Trường ĐH Thủy lợi",
     "address": "175 Tây Sơn, Đống Đa, Hà Nội", "website": "https://tlu.edu.vn",
     "description": "Đào tạo kỹ sư thủy lợi, môi trường và quản lý tài nguyên nước."},
]

uni_map = {}
for ud in universities_data:
    existing = db.query(University).filter(University.name == ud["name"]).first()
    if not existing:
        uni = University(**ud)
        db.add(uni)
        db.commit()
        db.refresh(uni)
        uni_map[ud["name"]] = uni.id
        print(f"✅ Tạo trường: {ud['name']}")
    else:
        uni_map[ud["name"]] = existing.id
        print(f"⚠️  Trường đã tồn tại: {ud['name']}")

# ── Ngành học (~200 ngành) ─────────────────────────────────────────────────
def u(name):
    return uni_map.get(name)

majors_data = [
    # ICTU (10 ngành)
    {"name": "Kỹ thuật Phần mềm", "code": "7480103", "subject_group": "A00, A01", "benchmark": 22.5, "quota": 200, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Đào tạo kỹ sư phần mềm có khả năng thiết kế, xây dựng và vận hành hệ thống phần mềm."},
    {"name": "Công nghệ Thông tin", "code": "7480201", "subject_group": "A00, A01, D01", "benchmark": 21.0, "quota": 300, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Đào tạo cử nhân CNTT toàn diện về lập trình, mạng máy tính và hệ thống thông tin."},
    {"name": "Mạng máy tính và Truyền thông dữ liệu", "code": "7480102", "subject_group": "A00, A01", "benchmark": 20.0, "quota": 100, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Chuyên sâu về hạ tầng mạng, bảo mật và truyền thông số."},
    {"name": "Trí tuệ nhân tạo", "code": "7480107", "subject_group": "A00, A01", "benchmark": 24.0, "quota": 80, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Đào tạo chuyên gia AI/ML, xử lý ngôn ngữ tự nhiên và thị giác máy tính."},
    {"name": "An toàn thông tin", "code": "7480202", "subject_group": "A00, A01", "benchmark": 22.0, "quota": 80, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Đào tạo chuyên gia bảo mật hệ thống, phân tích và phòng thủ mạng."},
    {"name": "Hệ thống thông tin", "code": "7480104", "subject_group": "A00, A01, D01", "benchmark": 19.5, "quota": 120, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Phân tích, thiết kế và quản trị hệ thống thông tin doanh nghiệp."},
    {"name": "Khoa học Dữ liệu", "code": "7480109", "subject_group": "A00, A01", "benchmark": 23.0, "quota": 60, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Phân tích dữ liệu lớn, học máy và trực quan hóa dữ liệu."},
    {"name": "Điện tử Viễn thông", "code": "7520207", "subject_group": "A00, A01", "benchmark": 19.0, "quota": 100, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Thiết kế và vận hành hệ thống điện tử, viễn thông."},
    {"name": "Kỹ thuật Máy tính", "code": "7480106", "subject_group": "A00, A01", "benchmark": 20.5, "quota": 80, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Thiết kế phần cứng, vi xử lý và hệ thống nhúng."},
    {"name": "Thương mại điện tử", "code": "7340122", "subject_group": "A00, A01, D01", "benchmark": 20.0, "quota": 100, "university_id": u("Trường ĐH Công nghệ Thông tin và Truyền thông - ĐH Thái Nguyên"), "description": "Kết hợp kinh doanh và công nghệ trong môi trường số."},
    # HUST (10 ngành)
    {"name": "Khoa học Máy tính", "code": "7480101", "subject_group": "A00, A01", "benchmark": 28.5, "quota": 150, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Chương trình tiên tiến về lý thuyết và thực hành khoa học máy tính."},
    {"name": "Kỹ thuật Điện tử Viễn thông", "code": "7520207", "subject_group": "A00, A01", "benchmark": 27.0, "quota": 200, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Đào tạo kỹ sư điện tử, vi xử lý và hệ thống nhúng."},
    {"name": "Kỹ thuật Cơ điện tử", "code": "7520114", "subject_group": "A00, A01", "benchmark": 27.5, "quota": 120, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Kết hợp cơ khí, điện tử và điều khiển tự động."},
    {"name": "Kỹ thuật Hóa học", "code": "7520301", "subject_group": "A00, B00", "benchmark": 25.0, "quota": 180, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Đào tạo kỹ sư hóa học ứng dụng trong công nghiệp."},
    {"name": "Kỹ thuật Điện", "code": "7520201", "subject_group": "A00, A01", "benchmark": 26.5, "quota": 200, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Hệ thống điện, điện lực và tự động hóa công nghiệp."},
    {"name": "Kỹ thuật Vật liệu", "code": "7520309", "subject_group": "A00, B00", "benchmark": 24.5, "quota": 100, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Nghiên cứu và phát triển vật liệu kỹ thuật cao."},
    {"name": "Toán Tin ứng dụng", "code": "7460117", "subject_group": "A00, A01", "benchmark": 27.0, "quota": 80, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Ứng dụng toán học và thuật toán trong giải quyết bài toán thực tế."},
    {"name": "Vật lý Kỹ thuật", "code": "7520401", "subject_group": "A00, A01", "benchmark": 25.5, "quota": 60, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Nghiên cứu vật lý ứng dụng trong kỹ thuật và công nghệ."},
    {"name": "Kỹ thuật Môi trường", "code": "7520320", "subject_group": "A00, B00", "benchmark": 24.0, "quota": 100, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Xử lý ô nhiễm và bảo vệ môi trường công nghiệp."},
    {"name": "Quản lý Công nghiệp", "code": "7510601", "subject_group": "A00, A01, D01", "benchmark": 25.0, "quota": 120, "university_id": u("Trường ĐH Bách khoa Hà Nội"), "description": "Quản trị sản xuất và vận hành hệ thống công nghiệp."},
    # UET (10 ngành)
    {"name": "Công nghệ Thông tin (Chất lượng cao)", "code": "7480201CLC", "subject_group": "A00, A01", "benchmark": 27.5, "quota": 100, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Chương trình chất lượng cao, giảng dạy bằng tiếng Anh."},
    {"name": "Kỹ thuật Phần mềm (ĐHQGHN)", "code": "7480103", "subject_group": "A00, A01, D01", "benchmark": 26.0, "quota": 120, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Đào tạo kỹ sư phần mềm theo chuẩn quốc tế của ĐHQGHN."},
    {"name": "Kỹ thuật Điện tử Viễn thông (ĐHQGHN)", "code": "7520207", "subject_group": "A00, A01", "benchmark": 26.5, "quota": 100, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Thiết kế mạch điện tử, hệ thống viễn thông và IoT."},
    {"name": "Trí tuệ nhân tạo (ĐHQGHN)", "code": "7480107", "subject_group": "A00, A01", "benchmark": 28.0, "quota": 60, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Deep learning, NLP và ứng dụng AI trong thực tiễn."},
    {"name": "An toàn thông tin (ĐHQGHN)", "code": "7480202", "subject_group": "A00, A01", "benchmark": 27.0, "quota": 60, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Bảo mật mạng, mật mã học và kiểm thử xâm nhập."},
    {"name": "Khoa học Máy tính (ĐHQGHN)", "code": "7480101", "subject_group": "A00, A01", "benchmark": 27.0, "quota": 80, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Lý thuyết tính toán, thuật toán và hệ thống phân tán."},
    {"name": "Vật lý Kỹ thuật (ĐHQGHN)", "code": "7520401", "subject_group": "A00, A01", "benchmark": 25.0, "quota": 50, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Vật lý bán dẫn, quang học và vật liệu tiên tiến."},
    {"name": "Kỹ thuật Robot (ĐHQGHN)", "code": "7520216", "subject_group": "A00, A01", "benchmark": 27.5, "quota": 50, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Thiết kế robot, tự động hóa và hệ thống điều khiển thông minh."},
    {"name": "Công nghệ Nano (ĐHQGHN)", "code": "7520402", "subject_group": "A00, B00", "benchmark": 25.5, "quota": 40, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Ứng dụng công nghệ nano trong y tế, điện tử và vật liệu."},
    {"name": "Khoa học Dữ liệu (ĐHQGHN)", "code": "7480109", "subject_group": "A00, A01", "benchmark": 27.0, "quota": 60, "university_id": u("Trường ĐH Công nghệ - ĐH Quốc gia Hà Nội"), "description": "Big data, machine learning và phân tích dữ liệu ứng dụng."},
    # FPT (10 ngành)
    {"name": "Kỹ thuật Phần mềm (FPT)", "code": "7480103F", "subject_group": "A00, A01, D01", "benchmark": 24.5, "quota": 500, "university_id": u("Trường ĐH FPT"), "description": "Học theo dự án thực tế, kết nối doanh nghiệp FPT Software."},
    {"name": "Thiết kế mỹ thuật số", "code": "7210403", "subject_group": "H00, V00", "benchmark": 22.0, "quota": 200, "university_id": u("Trường ĐH FPT"), "description": "Đào tạo thiết kế đồ họa, UI/UX và truyền thông đa phương tiện."},
    {"name": "Trí tuệ nhân tạo (FPT)", "code": "7480107F", "subject_group": "A00, A01", "benchmark": 26.0, "quota": 150, "university_id": u("Trường ĐH FPT"), "description": "Chuyên sâu AI, Machine Learning và Data Science ứng dụng."},
    {"name": "An toàn thông tin (FPT)", "code": "7480202F", "subject_group": "A00, A01", "benchmark": 25.0, "quota": 120, "university_id": u("Trường ĐH FPT"), "description": "Bảo mật thông tin, ethical hacking và quản trị rủi ro."},
    {"name": "Kinh doanh số", "code": "7340101F", "subject_group": "A00, D01", "benchmark": 24.0, "quota": 200, "university_id": u("Trường ĐH FPT"), "description": "Quản trị kinh doanh trong môi trường số, thương mại điện tử."},
    {"name": "Quản trị khách sạn", "code": "7810201F", "subject_group": "D01, C00", "benchmark": 21.5, "quota": 150, "university_id": u("Trường ĐH FPT"), "description": "Quản lý nhà hàng, khách sạn và du lịch quốc tế."},
    {"name": "Ngôn ngữ Anh (FPT)", "code": "7220201F", "subject_group": "D01, D14", "benchmark": 26.0, "quota": 200, "university_id": u("Trường ĐH FPT"), "description": "Tiếng Anh chuyên ngành thương mại và truyền thông."},
    {"name": "Ngôn ngữ Nhật (FPT)", "code": "7220209F", "subject_group": "D01, D14", "benchmark": 24.0, "quota": 150, "university_id": u("Trường ĐH FPT"), "description": "Tiếng Nhật ứng dụng trong môi trường doanh nghiệp Nhật Bản."},
    {"name": "Quản trị kinh doanh (FPT)", "code": "7340101", "subject_group": "A00, D01", "benchmark": 23.5, "quota": 250, "university_id": u("Trường ĐH FPT"), "description": "Khởi nghiệp, quản trị và điều hành doanh nghiệp theo mô hình hiện đại."},
    {"name": "Công nghệ Ô tô (FPT)", "code": "7520116F", "subject_group": "A00, A01", "benchmark": 22.5, "quota": 100, "university_id": u("Trường ĐH FPT"), "description": "Kỹ thuật ô tô điện và hệ thống điều khiển xe thông minh."},
    # NEU (10 ngành)
    {"name": "Kinh tế học", "code": "7310101", "subject_group": "A00, A01, D01", "benchmark": 26.5, "quota": 200, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Phân tích kinh tế vĩ mô, vi mô và chính sách kinh tế."},
    {"name": "Quản trị kinh doanh", "code": "7340101", "subject_group": "A00, D01", "benchmark": 27.0, "quota": 250, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Quản lý doanh nghiệp, marketing và chiến lược kinh doanh."},
    {"name": "Kế toán", "code": "7340301", "subject_group": "A00, D01", "benchmark": 26.0, "quota": 300, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Hạch toán kế toán, kiểm toán và phân tích tài chính."},
    {"name": "Tài chính - Ngân hàng", "code": "7340201", "subject_group": "A00, D01", "benchmark": 27.5, "quota": 250, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Quản trị tài chính doanh nghiệp, ngân hàng và thị trường vốn."},
    {"name": "Hệ thống thông tin quản lý", "code": "7340405", "subject_group": "A00, D01", "benchmark": 25.5, "quota": 120, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Ứng dụng CNTT trong quản lý doanh nghiệp và phân tích dữ liệu."},
    {"name": "Thống kê kinh tế", "code": "7310107", "subject_group": "A00, D01", "benchmark": 25.0, "quota": 100, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Phân tích dữ liệu kinh tế, dự báo và nghiên cứu thị trường."},
    {"name": "Kinh doanh quốc tế", "code": "7340120", "subject_group": "A00, D01", "benchmark": 27.0, "quota": 150, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Thương mại quốc tế, xuất nhập khẩu và đầu tư nước ngoài."},
    {"name": "Bảo hiểm", "code": "7340204", "subject_group": "A00, D01", "benchmark": 24.5, "quota": 80, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Quản trị rủi ro và kinh doanh bảo hiểm."},
    {"name": "Marketing", "code": "7340115", "subject_group": "A00, D01", "benchmark": 27.0, "quota": 200, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Nghiên cứu thị trường, truyền thông và phát triển thương hiệu."},
    {"name": "Logistics và Quản lý chuỗi cung ứng", "code": "7510605", "subject_group": "A00, D01", "benchmark": 26.0, "quota": 120, "university_id": u("Trường ĐH Kinh tế Quốc dân"), "description": "Quản lý vận tải, kho bãi và chuỗi cung ứng toàn cầu."},
    # FTU (10 ngành)
    {"name": "Kinh tế quốc tế", "code": "7310106", "subject_group": "A00, D01", "benchmark": 28.0, "quota": 200, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Phân tích kinh tế thế giới và quan hệ kinh tế quốc tế."},
    {"name": "Thương mại quốc tế", "code": "7340120", "subject_group": "A00, D01", "benchmark": 28.5, "quota": 250, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Xuất nhập khẩu, đàm phán hợp đồng và logistics quốc tế."},
    {"name": "Tài chính quốc tế", "code": "7340201", "subject_group": "A00, D01", "benchmark": 27.5, "quota": 150, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Quản trị tài chính và đầu tư quốc tế."},
    {"name": "Quản trị kinh doanh quốc tế", "code": "7340101", "subject_group": "A00, D01", "benchmark": 28.0, "quota": 200, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Điều hành doanh nghiệp đa quốc gia và quản lý dự án quốc tế."},
    {"name": "Kế toán - Kiểm toán (FTU)", "code": "7340301", "subject_group": "A00, D01", "benchmark": 26.5, "quota": 150, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Kế toán doanh nghiệp quốc tế và chuẩn mực IFRS."},
    {"name": "Ngôn ngữ Anh thương mại", "code": "7220201", "subject_group": "D01, D14", "benchmark": 29.0, "quota": 200, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Tiếng Anh chuyên ngành thương mại, đàm phán và dịch thuật."},
    {"name": "Ngôn ngữ Trung Quốc (FTU)", "code": "7220204", "subject_group": "D01, D04", "benchmark": 27.0, "quota": 100, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Tiếng Trung thương mại và quan hệ kinh tế Việt - Trung."},
    {"name": "Luật kinh doanh quốc tế", "code": "7380107", "subject_group": "A00, D01", "benchmark": 27.5, "quota": 100, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Pháp luật thương mại quốc tế và giải quyết tranh chấp."},
    {"name": "Marketing quốc tế", "code": "7340115", "subject_group": "A00, D01", "benchmark": 27.0, "quota": 150, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Xây dựng thương hiệu và chiến lược marketing toàn cầu."},
    {"name": "Hải quan - Logistics (FTU)", "code": "7510605", "subject_group": "A00, D01", "benchmark": 26.0, "quota": 100, "university_id": u("Trường ĐH Ngoại thương Hà Nội"), "description": "Thủ tục hải quan, vận tải biển và quản lý chuỗi cung ứng toàn cầu."},
    # Y Hà Nội (8 ngành)
    {"name": "Y khoa", "code": "7720101", "subject_group": "B00", "benchmark": 29.5, "quota": 300, "university_id": u("Trường ĐH Y Hà Nội"), "description": "Đào tạo bác sĩ đa khoa với thời gian học 6 năm."},
    {"name": "Dược học", "code": "7720201", "subject_group": "B00, A00", "benchmark": 28.0, "quota": 150, "university_id": u("Trường ĐH Y Hà Nội"), "description": "Nghiên cứu, sản xuất và quản lý thuốc."},
    {"name": "Răng Hàm Mặt", "code": "7720501", "subject_group": "B00", "benchmark": 29.0, "quota": 80, "university_id": u("Trường ĐH Y Hà Nội"), "description": "Phòng và điều trị bệnh răng miệng."},
    {"name": "Y tế công cộng", "code": "7720701", "subject_group": "B00, A00", "benchmark": 25.0, "quota": 100, "university_id": u("Trường ĐH Y Hà Nội"), "description": "Quản lý và phòng chống dịch bệnh cộng đồng."},
    {"name": "Điều dưỡng", "code": "7720301", "subject_group": "B00", "benchmark": 23.5, "quota": 200, "university_id": u("Trường ĐH Y Hà Nội"), "description": "Chăm sóc và hỗ trợ điều trị bệnh nhân."},
    {"name": "Kỹ thuật xét nghiệm y học", "code": "7720601", "subject_group": "B00", "benchmark": 24.0, "quota": 80, "university_id": u("Trường ĐH Y Hà Nội"), "description": "Phân tích mẫu bệnh phẩm, hỗ trợ chẩn đoán lâm sàng."},
    {"name": "Kỹ thuật hình ảnh y học", "code": "7720602", "subject_group": "B00, A00", "benchmark": 24.5, "quota": 60, "university_id": u("Trường ĐH Y Hà Nội"), "description": "Chụp X-quang, CT, MRI và siêu âm y tế."},
    {"name": "Dinh dưỡng", "code": "7720802", "subject_group": "B00", "benchmark": 23.0, "quota": 60, "university_id": u("Trường ĐH Y Hà Nội"), "description": "Tư vấn chế độ dinh dưỡng và hỗ trợ điều trị bệnh mạn tính."},
    # Sư phạm HN (8 ngành)
    {"name": "Sư phạm Toán học", "code": "7140209", "subject_group": "A00, A01", "benchmark": 27.5, "quota": 120, "university_id": u("Trường ĐH Sư phạm Hà Nội"), "description": "Đào tạo giáo viên dạy Toán các cấp THCS và THPT."},
    {"name": "Sư phạm Vật lý", "code": "7140211", "subject_group": "A00, A01", "benchmark": 26.0, "quota": 80, "university_id": u("Trường ĐH Sư phạm Hà Nội"), "description": "Đào tạo giáo viên Vật lý và nghiên cứu khoa học tự nhiên."},
    {"name": "Sư phạm Ngữ văn", "code": "7140217", "subject_group": "C00, D01", "benchmark": 28.0, "quota": 100, "university_id": u("Trường ĐH Sư phạm Hà Nội"), "description": "Đào tạo giáo viên Ngữ văn và nghiên cứu văn học."},
    {"name": "Sư phạm Tiếng Anh", "code": "7140231", "subject_group": "D01, D14", "benchmark": 29.0, "quota": 150, "university_id": u("Trường ĐH Sư phạm Hà Nội"), "description": "Giảng dạy Tiếng Anh và đào tạo ngoại ngữ."},
    {"name": "Tâm lý học giáo dục", "code": "7310401", "subject_group": "A00, C00", "benchmark": 26.5, "quota": 80, "university_id": u("Trường ĐH Sư phạm Hà Nội"), "description": "Tư vấn học đường và hỗ trợ phát triển tâm lý học sinh."},
    {"name": "Giáo dục Mầm non", "code": "7140201", "subject_group": "M00, C00", "benchmark": 24.0, "quota": 120, "university_id": u("Trường ĐH Sư phạm Hà Nội"), "description": "Chăm sóc và giáo dục trẻ em lứa tuổi mầm non."},
    {"name": "Quản lý giáo dục", "code": "7140114", "subject_group": "A00, D01", "benchmark": 25.5, "quota": 80, "university_id": u("Trường ĐH Sư phạm Hà Nội"), "description": "Lãnh đạo, quản lý nhà trường và hệ thống giáo dục."},
    {"name": "Công nghệ giáo dục", "code": "7140110", "subject_group": "A00, D01", "benchmark": 24.5, "quota": 60, "university_id": u("Trường ĐH Sư phạm Hà Nội"), "description": "Ứng dụng CNTT và e-learning trong dạy học."},
    # Luật HN (6 ngành)
    {"name": "Luật học", "code": "7380101", "subject_group": "A00, C00, D01", "benchmark": 27.0, "quota": 400, "university_id": u("Trường ĐH Luật Hà Nội"), "description": "Đào tạo cử nhân luật toàn diện về luật dân sự, hình sự và hành chính."},
    {"name": "Luật Kinh tế", "code": "7380107", "subject_group": "A00, D01", "benchmark": 28.0, "quota": 200, "university_id": u("Trường ĐH Luật Hà Nội"), "description": "Pháp luật thương mại, hợp đồng và doanh nghiệp."},
    {"name": "Quản trị Luật", "code": "7380108", "subject_group": "A00, D01", "benchmark": 26.5, "quota": 100, "university_id": u("Trường ĐH Luật Hà Nội"), "description": "Quản lý pháp chế doanh nghiệp và tư vấn pháp lý."},
    {"name": "Tội phạm học", "code": "7380103", "subject_group": "C00, D01", "benchmark": 25.5, "quota": 80, "university_id": u("Trường ĐH Luật Hà Nội"), "description": "Phòng chống tội phạm và tư pháp hình sự."},
    {"name": "Luật Quốc tế", "code": "7380109", "subject_group": "D01, A00", "benchmark": 27.5, "quota": 80, "university_id": u("Trường ĐH Luật Hà Nội"), "description": "Công pháp và tư pháp quốc tế, giải quyết tranh chấp quốc tế."},
    {"name": "Kế toán - Kiểm toán (Luật)", "code": "7340301L", "subject_group": "A00, D01", "benchmark": 25.0, "quota": 80, "university_id": u("Trường ĐH Luật Hà Nội"), "description": "Kế toán pháp lý và kiểm toán tuân thủ pháp luật."},
    # Xây dựng HN (8 ngành)
    {"name": "Kỹ thuật Xây dựng", "code": "7580201", "subject_group": "A00, A01", "benchmark": 24.5, "quota": 300, "university_id": u("Trường ĐH Xây dựng Hà Nội"), "description": "Thiết kế và thi công công trình dân dụng, công nghiệp."},
    {"name": "Kiến trúc", "code": "7580101", "subject_group": "V00, H00", "benchmark": 26.0, "quota": 150, "university_id": u("Trường ĐH Xây dựng Hà Nội"), "description": "Thiết kế kiến trúc công trình dân dụng và đô thị."},
    {"name": "Kỹ thuật Hạ tầng đô thị", "code": "7580206", "subject_group": "A00, A01", "benchmark": 23.0, "quota": 100, "university_id": u("Trường ĐH Xây dựng Hà Nội"), "description": "Quy hoạch và xây dựng hạ tầng đô thị."},
    {"name": "Kỹ thuật Cầu đường", "code": "7580205", "subject_group": "A00, A01", "benchmark": 23.5, "quota": 150, "university_id": u("Trường ĐH Xây dựng Hà Nội"), "description": "Thiết kế và thi công cầu, đường bộ và đường cao tốc."},
    {"name": "Địa kỹ thuật Xây dựng", "code": "7580203", "subject_group": "A00, A01", "benchmark": 22.0, "quota": 80, "university_id": u("Trường ĐH Xây dựng Hà Nội"), "description": "Khảo sát địa chất, nền móng và xử lý đất."},
    {"name": "Kỹ thuật Môi trường (XD)", "code": "7580303", "subject_group": "A00, B00", "benchmark": 22.5, "quota": 80, "university_id": u("Trường ĐH Xây dựng Hà Nội"), "description": "Cấp thoát nước, xử lý chất thải và bảo vệ môi trường đô thị."},
    {"name": "Quản lý Dự án Xây dựng", "code": "7580302", "subject_group": "A00, D01", "benchmark": 23.0, "quota": 100, "university_id": u("Trường ĐH Xây dựng Hà Nội"), "description": "Lập kế hoạch, điều phối và kiểm soát dự án xây dựng."},
    {"name": "Công nghệ kỹ thuật Xây dựng", "code": "7510102", "subject_group": "A00", "benchmark": 21.0, "quota": 120, "university_id": u("Trường ĐH Xây dựng Hà Nội"), "description": "Thi công xây dựng và quản lý công trường."},
    # Bách khoa HCM (10 ngành)
    {"name": "Kỹ thuật Máy tính (HCMUT)", "code": "7480106", "subject_group": "A00, A01", "benchmark": 27.0, "quota": 150, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Thiết kế vi mạch, hệ thống nhúng và kiến trúc máy tính."},
    {"name": "Khoa học Máy tính (HCMUT)", "code": "7480101", "subject_group": "A00, A01", "benchmark": 27.5, "quota": 120, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Thuật toán, phần mềm hệ thống và trí tuệ nhân tạo."},
    {"name": "Kỹ thuật Điện (HCMUT)", "code": "7520201", "subject_group": "A00, A01", "benchmark": 26.5, "quota": 200, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Hệ thống điện và tự động hóa công nghiệp."},
    {"name": "Kỹ thuật Hóa học (HCMUT)", "code": "7520301", "subject_group": "A00, B00", "benchmark": 25.5, "quota": 180, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Công nghệ hóa học và chế biến dầu khí."},
    {"name": "Kỹ thuật Xây dựng (HCMUT)", "code": "7580201", "subject_group": "A00, A01", "benchmark": 25.0, "quota": 200, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Xây dựng công trình dân dụng và công nghiệp tại phía Nam."},
    {"name": "Kỹ thuật Giao thông (HCMUT)", "code": "7580205", "subject_group": "A00, A01", "benchmark": 24.5, "quota": 150, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Cầu đường, cảng biển và hạ tầng giao thông."},
    {"name": "Quản lý Công nghiệp (HCMUT)", "code": "7510601", "subject_group": "A00, D01", "benchmark": 25.5, "quota": 120, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Tối ưu hóa sản xuất và chuỗi cung ứng công nghiệp."},
    {"name": "Kỹ thuật Môi trường (HCMUT)", "code": "7520320", "subject_group": "A00, B00", "benchmark": 24.0, "quota": 100, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Xử lý nước thải, khí thải và quản lý chất thải rắn."},
    {"name": "Sinh học Kỹ thuật (HCMUT)", "code": "7420201", "subject_group": "B00, A00", "benchmark": 23.5, "quota": 80, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Công nghệ sinh học ứng dụng trong y dược và nông nghiệp."},
    {"name": "Toán ứng dụng (HCMUT)", "code": "7460117", "subject_group": "A00, A01", "benchmark": 26.0, "quota": 80, "university_id": u("Trường ĐH Bách khoa TP.HCM"), "description": "Mô hình toán học và tối ưu hóa ứng dụng."},
    # HCMUS (8 ngành)
    {"name": "Công nghệ Thông tin (HCMUS)", "code": "7480201", "subject_group": "A00, A01", "benchmark": 26.0, "quota": 200, "university_id": u("Trường ĐH Khoa học Tự nhiên TP.HCM"), "description": "Đào tạo cử nhân CNTT chất lượng cao tại TP.HCM."},
    {"name": "Khoa học Máy tính (HCMUS)", "code": "7480101", "subject_group": "A00, A01", "benchmark": 26.5, "quota": 150, "university_id": u("Trường ĐH Khoa học Tự nhiên TP.HCM"), "description": "Lý thuyết tính toán và phát triển phần mềm hệ thống."},
    {"name": "Toán học", "code": "7460101", "subject_group": "A00, A01", "benchmark": 24.0, "quota": 100, "university_id": u("Trường ĐH Khoa học Tự nhiên TP.HCM"), "description": "Toán thuần túy, toán ứng dụng và thống kê."},
    {"name": "Vật lý học", "code": "7440102", "subject_group": "A00, A01", "benchmark": 23.5, "quota": 80, "university_id": u("Trường ĐH Khoa học Tự nhiên TP.HCM"), "description": "Vật lý lý thuyết, vật lý hạt nhân và vật lý ứng dụng."},
    {"name": "Hóa học", "code": "7440112", "subject_group": "A00, B00", "benchmark": 23.0, "quota": 100, "university_id": u("Trường ĐH Khoa học Tự nhiên TP.HCM"), "description": "Hóa hữu cơ, vô cơ và phân tích ứng dụng."},
    {"name": "Sinh học", "code": "7420101", "subject_group": "B00", "benchmark": 22.5, "quota": 100, "university_id": u("Trường ĐH Khoa học Tự nhiên TP.HCM"), "description": "Di truyền học, sinh thái học và công nghệ sinh học."},
    {"name": "Khoa học môi trường", "code": "7440301", "subject_group": "A00, B00", "benchmark": 22.0, "quota": 80, "university_id": u("Trường ĐH Khoa học Tự nhiên TP.HCM"), "description": "Quản lý tài nguyên thiên nhiên và môi trường sinh thái."},
    {"name": "Địa chất học", "code": "7440201", "subject_group": "A00, B00", "benchmark": 21.5, "quota": 60, "university_id": u("Trường ĐH Khoa học Tự nhiên TP.HCM"), "description": "Địa chất công trình, tài nguyên khoáng sản và địa vật lý."},
    # UEH (8 ngành)
    {"name": "Quản trị kinh doanh (UEH)", "code": "7340101", "subject_group": "A00, D01", "benchmark": 26.0, "quota": 300, "university_id": u("Trường ĐH Kinh tế TP.HCM"), "description": "Quản trị doanh nghiệp, khởi nghiệp và chiến lược kinh doanh."},
    {"name": "Kế toán (UEH)", "code": "7340301", "subject_group": "A00, D01", "benchmark": 25.5, "quota": 250, "university_id": u("Trường ĐH Kinh tế TP.HCM"), "description": "Kế toán tài chính, kế toán quản trị và kiểm toán."},
    {"name": "Tài chính - Ngân hàng (UEH)", "code": "7340201", "subject_group": "A00, D01", "benchmark": 26.5, "quota": 200, "university_id": u("Trường ĐH Kinh tế TP.HCM"), "description": "Phân tích tài chính, đầu tư chứng khoán và ngân hàng thương mại."},
    {"name": "Kinh tế học (UEH)", "code": "7310101", "subject_group": "A00, D01", "benchmark": 25.0, "quota": 150, "university_id": u("Trường ĐH Kinh tế TP.HCM"), "description": "Phân tích kinh tế và chính sách phát triển."},
    {"name": "Marketing (UEH)", "code": "7340115", "subject_group": "A00, D01", "benchmark": 26.0, "quota": 200, "university_id": u("Trường ĐH Kinh tế TP.HCM"), "description": "Digital marketing, nghiên cứu thị trường và thương hiệu."},
    {"name": "Kinh doanh quốc tế (UEH)", "code": "7340120", "subject_group": "A00, D01", "benchmark": 26.5, "quota": 150, "university_id": u("Trường ĐH Kinh tế TP.HCM"), "description": "Thương mại điện tử xuyên biên giới và quản lý chuỗi cung ứng."},
    {"name": "Hệ thống thông tin kinh doanh", "code": "7340405", "subject_group": "A00, D01", "benchmark": 25.0, "quota": 100, "university_id": u("Trường ĐH Kinh tế TP.HCM"), "description": "ERP, phân tích dữ liệu kinh doanh và chuyển đổi số."},
    {"name": "Luật kinh tế (UEH)", "code": "7380107U", "subject_group": "A00, D01", "benchmark": 25.5, "quota": 100, "university_id": u("Trường ĐH Kinh tế TP.HCM"), "description": "Pháp luật doanh nghiệp và hợp đồng thương mại."},
    # Đà Nẵng (8 ngành)
    {"name": "Công nghệ Thông tin (ĐN)", "code": "7480201DN", "subject_group": "A00, A01", "benchmark": 24.0, "quota": 200, "university_id": u("Trường ĐH Đà Nẵng"), "description": "Đào tạo kỹ sư CNTT tại miền Trung."},
    {"name": "Kỹ thuật Điện tử (ĐN)", "code": "7520207DN", "subject_group": "A00, A01", "benchmark": 23.5, "quota": 150, "university_id": u("Trường ĐH Đà Nẵng"), "description": "Điện tử viễn thông và hệ thống điều khiển."},
    {"name": "Kỹ thuật Xây dựng (ĐN)", "code": "7580201DN", "subject_group": "A00, A01", "benchmark": 23.0, "quota": 180, "university_id": u("Trường ĐH Đà Nẵng"), "description": "Xây dựng dân dụng và công nghiệp tại khu vực miền Trung."},
    {"name": "Kiến trúc (ĐN)", "code": "7580101DN", "subject_group": "V00, H00", "benchmark": 24.5, "quota": 80, "university_id": u("Trường ĐH Đà Nẵng"), "description": "Thiết kế kiến trúc và quy hoạch đô thị."},
    {"name": "Quản trị kinh doanh (ĐN)", "code": "7340101DN", "subject_group": "A00, D01", "benchmark": 24.0, "quota": 200, "university_id": u("Trường ĐH Đà Nẵng"), "description": "Điều hành doanh nghiệp vừa và nhỏ tại khu vực miền Trung."},
    {"name": "Ngôn ngữ Anh (ĐN)", "code": "7220201DN", "subject_group": "D01, D14", "benchmark": 26.0, "quota": 150, "university_id": u("Trường ĐH Đà Nẵng"), "description": "Tiếng Anh thương mại và hội nhập quốc tế."},
    {"name": "Du lịch (ĐN)", "code": "7810101DN", "subject_group": "D01, C00", "benchmark": 23.5, "quota": 120, "university_id": u("Trường ĐH Đà Nẵng"), "description": "Quản lý du lịch và dịch vụ lữ hành quốc tế."},
    {"name": "Y học (ĐN)", "code": "7720101DN", "subject_group": "B00", "benchmark": 27.5, "quota": 100, "university_id": u("Trường ĐH Đà Nẵng"), "description": "Đào tạo bác sĩ đa khoa phục vụ khu vực miền Trung."},
    # Cần Thơ (8 ngành)
    {"name": "Công nghệ Thông tin (CTU)", "code": "7480201CT", "subject_group": "A00, A01", "benchmark": 22.0, "quota": 150, "university_id": u("Trường ĐH Cần Thơ"), "description": "Đào tạo kỹ sư CNTT phục vụ Đồng bằng sông Cửu Long."},
    {"name": "Nông nghiệp (CTU)", "code": "7620101CT", "subject_group": "B00, A00", "benchmark": 19.0, "quota": 200, "university_id": u("Trường ĐH Cần Thơ"), "description": "Kỹ thuật trồng trọt, chăn nuôi và quản lý nông nghiệp."},
    {"name": "Thủy sản (CTU)", "code": "7620301CT", "subject_group": "B00, A00", "benchmark": 18.5, "quota": 150, "university_id": u("Trường ĐH Cần Thơ"), "description": "Nuôi trồng thủy sản và chế biến thực phẩm thủy sản."},
    {"name": "Kinh tế Nông nghiệp (CTU)", "code": "7620115CT", "subject_group": "A00, D01", "benchmark": 19.5, "quota": 100, "university_id": u("Trường ĐH Cần Thơ"), "description": "Quản lý kinh tế và phát triển nông thôn."},
    {"name": "Kỹ thuật Hóa học (CTU)", "code": "7520301CT", "subject_group": "A00, B00", "benchmark": 20.0, "quota": 100, "university_id": u("Trường ĐH Cần Thơ"), "description": "Công nghệ thực phẩm và chế biến hóa chất nông nghiệp."},
    {"name": "Môi trường học (CTU)", "code": "7440301CT", "subject_group": "A00, B00", "benchmark": 19.5, "quota": 80, "university_id": u("Trường ĐH Cần Thơ"), "description": "Bảo vệ môi trường sinh thái vùng sông nước."},
    {"name": "Quản trị kinh doanh (CTU)", "code": "7340101CT", "subject_group": "A00, D01", "benchmark": 20.5, "quota": 150, "university_id": u("Trường ĐH Cần Thơ"), "description": "Quản lý doanh nghiệp nông nghiệp và xuất khẩu nông sản."},
    {"name": "Kỹ thuật Xây dựng (CTU)", "code": "7580201CT", "subject_group": "A00, A01", "benchmark": 20.0, "quota": 120, "university_id": u("Trường ĐH Cần Thơ"), "description": "Xây dựng công trình thủy lợi và hạ tầng đồng bằng."},
    # Thủy lợi (6 ngành)
    {"name": "Kỹ thuật Thủy lợi", "code": "7580212", "subject_group": "A00, A01", "benchmark": 22.5, "quota": 200, "university_id": u("Trường ĐH Thủy lợi"), "description": "Thiết kế hồ đập, kênh mương và hệ thống tưới tiêu."},
    {"name": "Kỹ thuật Tài nguyên nước", "code": "7580213", "subject_group": "A00, A01", "benchmark": 21.5, "quota": 100, "university_id": u("Trường ĐH Thủy lợi"), "description": "Quản lý và khai thác tài nguyên nước mặt và nước ngầm."},
    {"name": "Kỹ thuật Biển", "code": "7580299", "subject_group": "A00, A01", "benchmark": 22.0, "quota": 80, "university_id": u("Trường ĐH Thủy lợi"), "description": "Xây dựng công trình ven biển, đê biển và cảng."},
    {"name": "Kỹ thuật Xây dựng (TL)", "code": "7580201TL", "subject_group": "A00, A01", "benchmark": 21.5, "quota": 150, "university_id": u("Trường ĐH Thủy lợi"), "description": "Công trình xây dựng thủy công và hạ tầng giao thông."},
    {"name": "Quản lý tài nguyên và môi trường", "code": "7850101", "subject_group": "A00, B00", "benchmark": 21.0, "quota": 80, "university_id": u("Trường ĐH Thủy lợi"), "description": "Quản lý lưu vực sông và ứng phó biến đổi khí hậu."},
    {"name": "Công nghệ thông tin (TL)", "code": "7480201TL", "subject_group": "A00, A01", "benchmark": 20.5, "quota": 80, "university_id": u("Trường ĐH Thủy lợi"), "description": "CNTT ứng dụng trong quản lý và giám sát hạ tầng thủy lợi."},
]

major_count = 0
for md in majors_data:
    if md.get("university_id") is None:
        continue
    existing = db.query(Major).filter(Major.name == md["name"], Major.university_id == md["university_id"]).first()
    if not existing:
        major = Major(**md)
        db.add(major)
        db.commit()
        major_count += 1
print(f"✅ Đã tạo {major_count} ngành học mới")

# ── Bài viết mẫu ──────────────────────────────────────────────────────────
admin_user = db.query(User).filter(User.email == "admin@gmail.com").first()
posts_data = [
    {"title": "Thông báo tuyển sinh đại học năm 2026", "type": "notice", "content": "Bộ Giáo dục và Đào tạo thông báo kế hoạch tuyển sinh đại học năm 2026. Thí sinh có thể đăng ký xét tuyển từ ngày 01/07/2026 đến 30/07/2026 trên Cổng thông tin tuyển sinh quốc gia."},
    {"title": "Điểm chuẩn đại học 2025 cập nhật đầy đủ", "type": "news", "content": "Tổng hợp điểm chuẩn các trường đại học khối kỹ thuật năm 2025. Nhìn chung, điểm chuẩn ngành CNTT và Kỹ thuật phần mềm tăng 0.5-1.5 điểm so với năm 2024."},
    {"title": "Hướng dẫn sử dụng chatbot tư vấn tuyển sinh DUTA", "type": "notice", "content": "Hệ thống chatbot AI DUTA hỗ trợ tư vấn tuyển sinh 24/7. Học sinh có thể đặt câu hỏi về ngành học, điểm chuẩn và định hướng nghề nghiệp."},
    {"title": "Top 10 ngành học có nhu cầu tuyển dụng cao nhất 2026", "type": "news", "content": "Theo khảo sát từ các doanh nghiệp, các ngành Kỹ thuật phần mềm, AI, An toàn thông tin, Dữ liệu và Y tế số đang dẫn đầu về nhu cầu tuyển dụng."},
    {"title": "Lịch thi THPT Quốc gia 2026", "type": "notice", "content": "Kỳ thi THPT Quốc gia 2026 dự kiến diễn ra vào cuối tháng 6/2026. Thí sinh cần lưu ý các môn thi và lịch đăng ký dự thi."},
    {"title": "Cách chọn ngành học phù hợp với sở thích và năng lực", "type": "news", "content": "Việc lựa chọn ngành học là quyết định quan trọng. Hãy cân nhắc dựa trên sở thích, điểm mạnh, triển vọng nghề nghiệp và mức thu nhập tương lai."},
    {"title": "Học bổng đại học 2026 - Cơ hội cho thí sinh xuất sắc", "type": "news", "content": "Nhiều trường đại học công bố chính sách học bổng hấp dẫn cho thí sinh đạt điểm cao trong kỳ thi THPT Quốc gia 2026."},
    {"title": "AI và tương lai nghề nghiệp: Những ngành nào an toàn?", "type": "news", "content": "Trong bối cảnh AI phát triển mạnh, các ngành đòi hỏi kỹ năng sáng tạo, tư duy phản biện và giao tiếp con người vẫn có tương lai bền vững."},
]
if admin_user:
    post_count = 0
    for pd in posts_data:
        if not db.query(Post).filter(Post.title == pd["title"]).first():
            post = Post(**pd, author_id=admin_user.id)
            db.add(post)
            db.commit()
            post_count += 1
    print(f"✅ Đã tạo {post_count} bài viết mới")

# ── 50 người dùng mẫu ─────────────────────────────────────────────────────
users_data = [
    ("Nguyễn Văn An", "nguyenvanan@gmail.com", "0901000001", "2006-03-15", "male", "Hà Nội", "lập trình, AI, toán học"),
    ("Trần Thị Bích", "tranthibich@gmail.com", "0901000002", "2006-05-20", "female", "TP.HCM", "kinh tế, marketing, ngoại ngữ"),
    ("Lê Văn Cường", "levancuong@gmail.com", "0901000003", "2006-01-10", "male", "Đà Nẵng", "xây dựng, kiến trúc, thiết kế"),
    ("Phạm Thị Dung", "phamthidung@gmail.com", "0901000004", "2006-07-25", "female", "Hà Nội", "y học, sinh học, hóa học"),
    ("Hoàng Văn Em", "hoangvanem@gmail.com", "0901000005", "2006-09-12", "male", "Nghệ An", "điện tử, robot, vật lý"),
    ("Vũ Thị Phương", "vuthiphuong@gmail.com", "0901000006", "2006-02-18", "female", "Hải Phòng", "tài chính, ngân hàng, kế toán"),
    ("Đặng Văn Giang", "dangvangiang@gmail.com", "0901000007", "2006-04-30", "male", "Thái Nguyên", "CNTT, lập trình web, game"),
    ("Bùi Thị Hoa", "buithihoa@gmail.com", "0901000008", "2006-06-14", "female", "Hà Nội", "sư phạm, văn học, ngoại ngữ"),
    ("Ngô Văn Hùng", "ngovanhung@gmail.com", "0901000009", "2006-08-22", "male", "TP.HCM", "luật, kinh tế, xã hội học"),
    ("Đinh Thị Lan", "dinhthilan@gmail.com", "0901000010", "2006-10-05", "female", "Cần Thơ", "nông nghiệp, môi trường, sinh học"),
    ("Trịnh Văn Minh", "trinhvanminh@gmail.com", "0901000011", "2006-03-28", "male", "Hà Nội", "khoa học máy tính, AI, bảo mật"),
    ("Lý Thị Ngọc", "lythingoc@gmail.com", "0901000012", "2006-05-17", "female", "TP.HCM", "thiết kế đồ họa, UI/UX, nghệ thuật"),
    ("Cao Văn Phúc", "caovanphuc@gmail.com", "0901000013", "2006-01-23", "male", "Đà Nẵng", "du lịch, quản trị khách sạn, tiếng Anh"),
    ("Mai Thị Quỳnh", "maithiquynh@gmail.com", "0901000014", "2006-07-08", "female", "Huế", "dược học, hóa học, y tế"),
    ("Phan Văn Sơn", "phanvanson@gmail.com", "0901000015", "2006-09-19", "male", "Nghệ An", "kỹ thuật hóa, vật liệu, công nghiệp"),
    ("Lưu Thị Tâm", "luuthitam@gmail.com", "0901000016", "2006-02-11", "female", "Hà Nội", "tâm lý học, giáo dục, xã hội"),
    ("Đỗ Văn Tuấn", "dovantuan@gmail.com", "0901000017", "2006-04-06", "male", "Thái Bình", "kỹ thuật điện, tự động hóa, robot"),
    ("Hồ Thị Uyên", "hothiuyen@gmail.com", "0901000018", "2006-06-29", "female", "TP.HCM", "thương mại quốc tế, tiếng Trung, logistics"),
    ("Tô Văn Vinh", "tovanvinh@gmail.com", "0901000019", "2006-08-15", "male", "Hà Nội", "vật lý kỹ thuật, toán, nghiên cứu khoa học"),
    ("Nông Thị Xuân", "nongthixuan@gmail.com", "0901000020", "2006-10-27", "female", "Thái Nguyên", "kế toán, tài chính, quản trị"),
    ("Bạch Văn Yên", "bachvanyen@gmail.com", "0901000021", "2006-03-03", "male", "Hà Nội", "an toàn thông tin, mạng máy tính, bảo mật"),
    ("Châu Thị Ánh", "chautbianh@gmail.com", "0901000022", "2006-05-31", "female", "TP.HCM", "marketing, kinh doanh số, truyền thông"),
    ("Dương Văn Bảo", "duongvanbao@gmail.com", "0901000023", "2006-01-16", "male", "Đà Nẵng", "kiến trúc, xây dựng, quy hoạch đô thị"),
    ("Giang Thị Cẩm", "giangthicam@gmail.com", "0901000024", "2006-07-20", "female", "Hà Nội", "điều dưỡng, y tế, chăm sóc sức khỏe"),
    ("Hà Văn Dũng", "havandung@gmail.com", "0901000025", "2006-09-07", "male", "Nam Định", "kỹ thuật phần mềm, lập trình mobile, web"),
    ("Khánh Thị Ái", "khanthiai@gmail.com", "0901000026", "2006-02-24", "female", "Hà Nội", "ngôn ngữ Anh, dịch thuật, văn hóa"),
    ("Lâm Văn Bình", "lamvanbinh@gmail.com", "0901000027", "2006-04-13", "male", "TP.HCM", "khoa học dữ liệu, machine learning, thống kê"),
    ("Mã Thị Chi", "mathichi@gmail.com", "0901000028", "2006-06-26", "female", "Cần Thơ", "thủy sản, nông nghiệp, môi trường"),
    ("Như Văn Đạt", "nhuvandat@gmail.com", "0901000029", "2006-08-09", "male", "Hà Nội", "luật kinh tế, thương mại, hợp đồng"),
    ("Oanh Thị Én", "oanthien@gmail.com", "0901000030", "2006-10-21", "female", "Hải Dương", "sư phạm toán, giáo dục, toán ứng dụng"),
    ("Quang Văn Phong", "quangvanphong@gmail.com", "0901000031", "2006-03-18", "male", "Hà Nội", "quản trị kinh doanh, khởi nghiệp, tài chính"),
    ("Rin Thị Gái", "rinthigai@gmail.com", "0901000032", "2006-05-04", "female", "TP.HCM", "công nghệ ô tô, cơ điện tử, kỹ thuật"),
    ("Sen Văn Hải", "senvanhai@gmail.com", "0901000033", "2006-01-29", "male", "Đồng Nai", "kỹ thuật môi trường, xử lý nước, chất thải"),
    ("Thu Thị Hiền", "tuthihien@gmail.com", "0901000034", "2006-07-13", "female", "Hà Nội", "ngôn ngữ Nhật, văn hóa Nhật, doanh nghiệp Nhật"),
    ("Ưu Văn Khoa", "uuvankhoa@gmail.com", "0901000035", "2006-09-26", "male", "Nghệ An", "toán học, vật lý, nghiên cứu khoa học"),
    ("Vân Thị Linh", "vanthilinh@gmail.com", "0901000036", "2006-02-07", "female", "Hà Nội", "tài chính quốc tế, ngân hàng, forex"),
    ("Xương Văn Minh", "xuongvanminh@gmail.com", "0901000037", "2006-04-20", "male", "Quảng Ninh", "địa chất, khai thác mỏ, tài nguyên"),
    ("Ý Thị Nhi", "ythinhi@gmail.com", "0901000038", "2006-06-02", "female", "TP.HCM", "sinh học, di truyền, công nghệ sinh học"),
    ("Ân Văn Phát", "anvanphat@gmail.com", "0901000039", "2006-08-16", "male", "Hà Nội", "kỹ thuật thủy lợi, thủy văn, biến đổi khí hậu"),
    ("Băng Thị Quế", "bangthique@gmail.com", "0901000040", "2006-10-29", "female", "Vĩnh Long", "kinh tế nông nghiệp, hợp tác xã, nông thôn"),
    ("Cao Văn Rõ", "caovanro@gmail.com", "0901000041", "2006-03-11", "male", "Hà Nội", "hóa học, vật liệu nano, công nghệ mới"),
    ("Dạ Thị Sen", "dathisen@gmail.com", "0901000042", "2006-05-24", "female", "TP.HCM", "quản lý dự án, PM, agile"),
    ("Ếch Văn Tâm", "echvantam@gmail.com", "0901000043", "2006-01-06", "male", "Đà Nẵng", "điện tử viễn thông, IoT, 5G"),
    ("Gà Thị Uyên", "gathiuyen@gmail.com", "0901000044", "2006-07-19", "female", "Hà Nội", "sư phạm tiếng Anh, ngôn ngữ, dịch thuật"),
    ("Hó Văn Văn", "hovanvan@gmail.com", "0901000045", "2006-09-01", "male", "Lạng Sơn", "CNTT, lập trình, ứng dụng di động"),
    ("Ỉn Thị Yến", "inthiyen@gmail.com", "0901000046", "2006-02-14", "female", "Hà Nội", "marketing số, content, mạng xã hội"),
    ("Kề Văn Vũ", "kevanvu@gmail.com", "0901000047", "2006-04-27", "male", "TP.HCM", "robot, tự động hóa, kỹ thuật cơ điện tử"),
    ("Lợi Thị Xoan", "loithixoan@gmail.com", "0901000048", "2006-06-10", "female", "Hà Nam", "y tế công cộng, dịch tễ, y học dự phòng"),
    ("Mơ Văn Ánh", "movanhanh@gmail.com", "0901000049", "2006-08-23", "male", "Hà Nội", "kiến trúc cảnh quan, quy hoạch, thiết kế đô thị"),
    ("Nở Thị Bông", "northibong@gmail.com", "0901000050", "2006-10-06", "female", "Huế", "văn học, lịch sử, sư phạm ngữ văn"),
]

user_map = {}
user_count = 0
for full_name, email, phone, dob_str, gender, address, interests in users_data:
    existing = db.query(User).filter(User.email == email).first()
    if not existing:
        user = User(
            full_name=full_name, email=email, phone=phone,
            date_of_birth=date.fromisoformat(dob_str),
            gender=gender, address=address, interests=interests,
            password_hash=hash_password("User@123"), role="user",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        user_map[email] = user.id
        user_count += 1
    else:
        user_map[email] = existing.id
print(f"✅ Đã tạo {user_count} người dùng mới (mật khẩu: User@123)")

# ── 200 đoạn hội thoại chat mẫu ───────────────────────────────────────────
chat_qa_pool = [
    ("Ngành Kỹ thuật phần mềm học những gì?", "Ngành Kỹ thuật phần mềm đào tạo các kỹ sư có khả năng thiết kế, xây dựng và vận hành hệ thống phần mềm. Các môn học gồm: Lập trình hướng đối tượng, Cấu trúc dữ liệu, Cơ sở dữ liệu, Kỹ thuật phần mềm, Mạng máy tính và các môn chuyên ngành như Phát triển ứng dụng web, Mobile, AI."),
    ("Điểm chuẩn ngành CNTT năm 2025 là bao nhiêu?", "Điểm chuẩn ngành CNTT năm 2025 dao động từ 19-28 điểm tùy trường. Cụ thể: ICTU khoảng 21 điểm, ĐH Bách khoa HN khoảng 28.5 điểm, ĐH Công nghệ ĐHQGHN khoảng 27.5 điểm."),
    ("Ngành Trí tuệ nhân tạo triển vọng không?", "Ngành Trí tuệ nhân tạo có triển vọng rất cao. Nhu cầu tuyển dụng chuyên gia AI tăng trưởng mạnh. Mức lương kỹ sư AI tại Việt Nam từ 15-50 triệu đồng/tháng."),
    ("Học ngành An toàn thông tin ra làm gì?", "Cử nhân An toàn thông tin có thể làm: Chuyên gia bảo mật, Kiểm thử xâm nhập, Phân tích mã độc, Quản trị hệ thống bảo mật, Tư vấn an ninh mạng cho doanh nghiệp."),
    ("Trường nào đào tạo ngành Y khoa tốt nhất?", "Các trường đào tạo Y khoa uy tín: ĐH Y Hà Nội (điểm chuẩn ~29.5), ĐH Y Dược TP.HCM, ĐH Y Dược Huế. Ngành Y học có thời gian học 6 năm và yêu cầu điểm đầu vào rất cao."),
    ("Ngành Marketing học những gì và ra trường làm gì?", "Ngành Marketing đào tạo: Nghiên cứu thị trường, Chiến lược thương hiệu, Digital marketing. Ra trường làm: Marketing Manager, Brand Manager, Content Creator, SEO/SEM Specialist."),
    ("Học ngành Luật ra làm gì?", "Cử nhân Luật có thể làm: Luật sư, Thẩm phán, Kiểm sát viên, Pháp chế doanh nghiệp, Tư vấn pháp lý. Ngành Luật Kinh tế đặc biệt có nhu cầu cao trong các doanh nghiệp FDI."),
    ("Ngành Kế toán và Tài chính - Ngân hàng khác nhau như thế nào?", "Kế toán tập trung vào ghi chép và báo cáo tài chính. Tài chính - Ngân hàng nghiên cứu quản lý vốn, đầu tư và hoạt động ngân hàng. Kế toán phù hợp nếu bạn thích làm việc có hệ thống; Tài chính - Ngân hàng phù hợp nếu bạn thích phân tích và đầu tư."),
    ("Có nên học ngành Du lịch không?", "Ngành Du lịch có tiềm năng tốt khi du lịch Việt Nam hồi phục mạnh. Nghề nghiệp gồm: Hướng dẫn viên, Quản lý khách sạn, Điều hành tour. Tuy nhiên thu nhập phụ thuộc nhiều vào mùa du lịch."),
    ("Ngành Khoa học Dữ liệu yêu cầu học gì?", "Khoa học Dữ liệu yêu cầu: Toán thống kê, Lập trình Python/R, Machine Learning, Kỹ thuật xử lý dữ liệu lớn. Ra trường làm: Data Analyst, Data Scientist. Mức lương 15-40 triệu/tháng."),
    ("Ngành Xây dựng có dễ xin việc không?", "Ngành Xây dựng luôn có nhu cầu nhân lực ổn định. Kỹ sư Xây dựng, Kiến trúc sư đều được tuyển dụng nhiều. Mức lương khởi điểm 8-12 triệu/tháng."),
    ("Học FPT có tốt không?", "ĐH FPT mạnh về CNTT và kết nối doanh nghiệp. Điểm mạnh: học theo dự án thực tế, kết nối FPT Software. Học phí khá cao (~50-70 triệu/năm)."),
    ("Ngành Nông nghiệp còn triển vọng không?", "Ngành Nông nghiệp công nghệ cao đang rất tiềm năng. Nông nghiệp 4.0 và nông nghiệp hữu cơ được đầu tư mạnh. Xuất khẩu nông sản Việt Nam cần nhiều nhân lực chất lượng."),
    ("Ngành Y tế công cộng là gì?", "Y tế công cộng nghiên cứu phòng chống dịch bệnh và quản lý chăm sóc sức khỏe cộng đồng. Ra trường làm tại: Trung tâm y tế dự phòng, Bộ Y tế, WHO, UNICEF."),
    ("Điều kiện xét tuyển đại học như thế nào?", "Xét tuyển đại học có nhiều phương thức: (1) Xét điểm thi THPT; (2) Xét học bạ; (3) Xét tuyển thẳng cho học sinh giỏi; (4) Thi đánh giá năng lực của ĐHQG."),
    ("Ngành Ngôn ngữ Anh ra làm gì?", "Cử nhân Ngôn ngữ Anh có thể làm: Phiên dịch, Biên dịch, Giáo viên tiếng Anh, Chuyên viên quan hệ quốc tế, Nhân viên trong doanh nghiệp FDI."),
    ("Học ngành Điện tử Viễn thông như thế nào?", "Ngành Điện tử Viễn thông đào tạo kỹ sư thiết kế mạch điện tử, hệ thống viễn thông, IoT. Ra trường làm tại Viettel, VNPT, Samsung, Intel."),
    ("Có nên theo học ngành Robot không?", "Ngành Robot và Tự động hóa rất tiềm năng trong cách mạng công nghiệp 4.0. Ra trường làm tại nhà máy tự động hóa, hãng xe hơi, công ty điện tử."),
    ("Ngành Thương mại quốc tế cần điểm bao nhiêu?", "Ngành Thương mại quốc tế yêu cầu điểm khá cao. Tại ĐH Ngoại thương HN khoảng 28-29 điểm. ĐH Kinh tế Quốc dân khoảng 26-27 điểm."),
    ("Ngành Công nghệ Sinh học làm gì sau ra trường?", "Cử nhân Công nghệ Sinh học có thể làm: Nghiên cứu viên, Kỹ sư sản xuất vaccine/thuốc, Chuyên gia kiểm định thực phẩm. Mức thu nhập 8-20 triệu/tháng."),
    ("Học ngành Sư phạm có được miễn học phí không?", "Theo quy định, sinh viên sư phạm được hỗ trợ học phí và sinh hoạt phí. Tuy nhiên sau tốt nghiệp cần công tác trong ngành giáo dục đủ thời gian quy định."),
    ("Ngành Logistics là gì?", "Logistics quản lý dòng chảy hàng hóa từ nguồn cung đến tay người tiêu dùng. Nhu cầu nhân lực tăng mạnh do thương mại điện tử bùng nổ. Lương khởi điểm 10-15 triệu/tháng."),
    ("Ngành Kiến trúc khác Xây dựng như thế nào?", "Kiến trúc tập trung vào sáng tạo không gian và thiết kế công trình. Xây dựng tập trung vào kỹ thuật thi công và kết cấu. Kiến trúc cần năng khiếu nghệ thuật; Xây dựng cần giỏi toán kỹ thuật."),
    ("Tôi thích toán, nên học ngành gì?", "Nếu bạn giỏi và thích toán: Toán Tin ứng dụng, Khoa học Dữ liệu, Khoa học Máy tính, Tài chính định lượng, Thống kê đều là lựa chọn tốt."),
    ("Học đại học ở đâu tốt hơn: Hà Nội hay TP.HCM?", "Hà Nội mạnh về trường công lập lâu đời. TP.HCM năng động, kết nối doanh nghiệp tốt, nhiều cơ hội thực tập. Chọn trường phù hợp với ngành và điều kiện gia đình."),
    ("Ngành Hóa học có việc làm không?", "Ngành Hóa học có cơ hội việc làm trong: công nghiệp hóa chất, dầu khí, dược phẩm, thực phẩm, vật liệu mới. Kỹ sư Hóa học lương khởi điểm 8-15 triệu/tháng."),
    ("Nên chọn học Đại học công lập hay tư thục?", "Đại học công lập: chi phí thấp, uy tín học thuật tốt. Đại học tư thục (FPT, RMIT): cơ sở vật chất hiện đại, kết nối doanh nghiệp tốt nhưng học phí cao."),
    ("Ngành Điều dưỡng ra trường làm gì?", "Cử nhân Điều dưỡng làm tại bệnh viện, phòng khám để chăm sóc bệnh nhân. Nhu cầu điều dưỡng rất lớn, kể cả xuất khẩu lao động sang Nhật, Đức, Hàn Quốc."),
    ("Có những phương thức xét tuyển nào?", "Các phương thức: (1) Xét điểm thi THPT; (2) Xét học bạ; (3) Xét tuyển thẳng học sinh giỏi; (4) Thi đánh giá năng lực ĐHQG; (5) Xét kết hợp nhiều tiêu chí."),
    ("Ngành Kỹ thuật Hóa học khác Hóa học như thế nào?", "Hóa học (khoa học) nghiên cứu lý thuyết và tính chất của chất. Kỹ thuật Hóa học ứng dụng hóa học vào quy trình công nghiệp. Kỹ thuật Hóa học thường có mức lương cao hơn."),
    ("Học Đại học Thái Nguyên có tốt không?", "ICTU là trường đầu ngành về CNTT ở khu vực Đông Bắc. Điểm mạnh: chuyên sâu CNTT, học phí hợp lý, môi trường học tập tốt, kết nối doanh nghiệp địa phương."),
    ("Tôi muốn làm game developer, học ngành nào?", "Để làm Game Developer: học Kỹ thuật Phần mềm hoặc Công nghệ Thông tin. Tự học thêm Unity, Unreal Engine, lập trình C#/C++. ĐH FPT có chuyên ngành phát triển game."),
    ("Ngành Quản trị khách sạn học gì?", "Ngành Quản trị khách sạn đào tạo: nghiệp vụ nhà hàng, buồng phòng, lễ tân, quản lý tiệc. Ra trường làm tại khách sạn 4-5 sao, resort, công ty lữ hành."),
    ("Điểm chuẩn ngành Y khoa bao nhiêu?", "Ngành Y khoa có điểm chuẩn cao nhất: ĐH Y Hà Nội khoảng 29-30 điểm, ĐH Y Dược TP.HCM khoảng 28-29 điểm. Yêu cầu thi khối B00 với điểm rất cao."),
    ("Học ngành gì để ra trường lương cao?", "Các ngành lương cao: (1) AI/Machine Learning: 20-50 triệu; (2) An toàn thông tin: 15-40 triệu; (3) Kỹ thuật phần mềm: 15-35 triệu; (4) Khoa học dữ liệu: 15-40 triệu."),
    ("Trường ĐH Cần Thơ có tốt không?", "ĐH Cần Thơ là trường lớn nhất vùng ĐBSCL, đặc biệt mạnh về nông nghiệp, thủy sản và môi trường. Học phí hợp lý và có nhiều học bổng."),
    ("Ngành Logistics có việc làm nhiều không?", "Ngành Logistics đang bùng nổ nhờ thương mại điện tử và xuất khẩu tăng mạnh. Nhu cầu tuyển dụng lớn tại Lazada, Shopee, DHL, FedEx và hàng ngàn doanh nghiệp xuất nhập khẩu."),
    ("Ngành Tâm lý học có triển vọng không?", "Tâm lý học đang phát triển mạnh tại Việt Nam. Cơ hội: Tư vấn học đường, Trị liệu tâm lý, HR, Nghiên cứu người tiêu dùng, Huấn luyện kỹ năng mềm."),
    ("Ngành Quản lý Tài nguyên nước là gì?", "Ngành này đào tạo chuyên gia quy hoạch và quản lý nguồn nước. Ra trường làm tại Bộ TN&MT, các Sở TN&MT, doanh nghiệp tư vấn thủy lợi. Rất quan trọng trong bối cảnh biến đổi khí hậu."),
    ("Có nên du học thay vì học trong nước không?", "Du học có lợi về môi trường quốc tế nhưng chi phí rất cao. Học trong nước tại các trường top (ĐHQG, Bách khoa, Ngoại thương) vẫn cho đầu ra tốt và tiết kiệm chi phí đáng kể."),
]

all_user_ids = list(user_map.values())
chat_count = 0
base_time = datetime.now(timezone.utc) - timedelta(days=30)

if all_user_ids:
    qa_count = len(chat_qa_pool)
    for i in range(200):
        user_id = all_user_ids[i % len(all_user_ids)]
        question, answer = chat_qa_pool[i % qa_count]
        created = base_time + timedelta(hours=i * 3 + random.randint(0, 2))
        existing = db.query(ChatHistory).filter(
            ChatHistory.user_id == user_id,
            ChatHistory.message == question,
        ).first()
        if not existing:
            db.add(ChatHistory(user_id=user_id, message=question, response=answer, created_at=created))
            chat_count += 1
    db.commit()
print(f"✅ Đã tạo {chat_count} đoạn hội thoại chat mẫu")

db.close()
print("\n🎉 Seed hoàn tất!")
print("   Admin: admin@gmail.com / Admin@123")
print("   User mẫu: (email từ danh sách) / User@123")
