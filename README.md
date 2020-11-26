# Ứng dụng xây dựng trải nghiệm chiếu sáng 3D
## Tổng quan
* Công nghệ sử dụng: có thể chạy trên web tĩnh, sử dụng framework của Javascript: A-Frame

## Chức năng
### Trải nghiệm kịch bản chiếu sáng tại các địa điểm khác nhau
* Tùy chỉnh từng loại đèn hoặc từng nhóm các đèn giống nhau: bật/tắt, chỉnh (màu, độ sáng) / (nhiệt độ, công suất) 
	* Giao diện:
		- Bật/Tắt toàn bộ
		- Danh sách các loại đèn có trong scene, có thể lựa chọn từng loại để tùy chỉnh
		- Nút bật/tắt riêng từng đèn
		- Nút đặt lại trạng thái mặc định
		- Chọn màu/nhiệt độ màu cho đèn
			- Thanh trượt để chọn giữa các màu
			- Một menu các màu có sẵn để chọn
			- Nút đặt lại màu mặc định
		- Chọn công suất cho đèn
			- Thanh trượt để chọn
			- Nút đặt lại mặc định
* Chọn kịch bản xây dựng sẵn (theo màu hè/mùa đông cũng tính là kịch bản có sẵn)
	* Các thay đổi có thể xảy ra khi chọn kịch bản
		- Trạng thái của từng đèn. Có thể hẹn giờ để trạng thái đèn thay đổi (ví dụ: đèn tắt sau 30s)
		- Mặt trời
		- Ngoài trời (skybox)
		- Vị trí người dùng (ví dụ: kịch bản người dùng bước vào phòng, cảm biến phát hiện làm bật đèn)
	* Giao diện
		- Danh sách các kịch bản
			- Tên
			- Chú thích
* Kịch bản theo thời gian
	* Giao diện
		- Các tùy chọn về thời gian (các nút sáng/chiều/tối, thanh trượt, nhập trực tiếp)
		- Chú thích tại các thời điểm

* Thứ tự ưu tiên:
	1. Thông số do người dùng tùy chỉnh
	2. Kịch bản xây dựng sẵn
	3. Kịch bản theo thời gian