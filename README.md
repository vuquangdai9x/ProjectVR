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

## Technical design
* Các object lớn: 
	* `ScenarioData`: Lưu trữ dữ liệu
		- Cấu trúc:
			- **light_definition**: chứa thông tin về cấu hình các loại ánh sáng
				- **list_lights**: Cấu hình các loại đèn, có thể tùy chỉnh bởi người dùng.
				- **list_natural_lights**: Cấu hình các loại ánh sáng tự nhiên (sun light, ambient light,...). Chỉ có thể điều chỉnh thông các kịch bản hoặc tùy thuộc vào thời gian. Người dùng không thể điều chỉnh loại ánh sáng này trực tiếp.
			- **scenario**: chứa thông tin về các kịch bản
			- **timeline**: chứa cấu hình tùy thuộc theo thời gian
			- **light_data**: chứa thông tin hiện tại về các loại ánh sáng. Có thể thay đổi.
				- **list_lights**: thông tin hiện tại của các loại đèn
				- **list_natural_lights**: thông tin hiện tại của các loại ánh sáng tự nhiên
	* `DataManager`: Xử lý các tác vụ liên quan đến dữ liệu. Đây là đối tượng duy nhất được quyền chỉnh sửa `ScenarioData.light_current_data`
		- Chức năng: 
			- Khởi tạo dữ liệu trong `ScenarioData`
				- Đọc dữ liệu json từ các file `light-properties-*.json`, `scenario-*.json`
				- Chuẩn hóa dữ liệu: lấp đầy các phần khai báo còn thiếu bằng dữ liệu mặc định
			- Cập nhật `ScenarioData.light_current_data` dựa vào các thiết lập trong `ScenarioData.light_static_data`, `ScenarioData.scenario`, `ScenarioData.timeline`, khi xảy ra các sự kiện (thời gian thay đổi, chọn kịch bản khác, người dùng tùy chỉnh thông số của đèn)
	* `SceneManager`: Đọc dữ liệu từ `ScenarioData.light_current_data` để thay đổi trạng thái của scene
	* `UIManager`: Quản lý việc tương tác giao diện người dùng
		- Chức năng:
			- Sinh ra giao diện từ file kịch bản
			- Xử lý sự kiện khi người dùng tương tác
			- Kiểm tra, chuẩn hóa đầu vào
			- Gọi đến phần xử lý tương ứng trong `DataManager`
			- Thay đổi giao diện
		- Lưu ý:
			- UIManager chỉ đọc dữ liệu, không tương tác gì với dữ liệu


