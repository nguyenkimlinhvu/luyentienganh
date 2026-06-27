// ============ DỮ LIỆU HỌC TIẾNG ANH: A1 → A2 → B1 → B2 (chuẩn CEFR) ============
// level: 1 = A1, 2 = A2, 3 = B1, 4 = B2
// Bạn có thể tự thêm/sửa từ vựng, câu ngữ pháp, đoạn nghe, câu nói ở đây.

const VOCAB_DATA = [
  // ========== LEVEL 1 — A1 ==========
  // Chủ đề: Gia đình
  { id:"v1", level:1, topic:"Gia đình", word:"family", phon:"/ˈfæməli/", meaning:"gia đình", example:"My family is small." },
  { id:"v2", level:1, topic:"Gia đình", word:"mother", phon:"/ˈmʌðər/", meaning:"mẹ", example:"My mother cooks every day." },
  { id:"v3", level:1, topic:"Gia đình", word:"father", phon:"/ˈfɑːðər/", meaning:"cha", example:"My father works in a bank." },
  { id:"v4", level:1, topic:"Gia đình", word:"sister", phon:"/ˈsɪstər/", meaning:"em/chị gái", example:"I have one sister." },
  { id:"v5", level:1, topic:"Gia đình", word:"brother", phon:"/ˈbrʌðər/", meaning:"anh/em trai", example:"My brother is tall." },
  // Chủ đề: Ăn uống
  { id:"v6", level:1, topic:"Ăn uống", word:"rice", phon:"/raɪs/", meaning:"cơm/gạo", example:"I eat rice every day." },
  { id:"v7", level:1, topic:"Ăn uống", word:"water", phon:"/ˈwɔːtər/", meaning:"nước", example:"I drink water in the morning." },
  { id:"v8", level:1, topic:"Ăn uống", word:"breakfast", phon:"/ˈbrekfəst/", meaning:"bữa sáng", example:"I have breakfast at 7 AM." },
  { id:"v9", level:1, topic:"Ăn uống", word:"hungry", phon:"/ˈhʌŋɡri/", meaning:"đói bụng", example:"I am hungry now." },
  { id:"v10", level:1, topic:"Ăn uống", word:"apple", phon:"/ˈæpəl/", meaning:"quả táo", example:"I eat an apple every day." },
  // Chủ đề: Số đếm
  { id:"v11", level:1, topic:"Số đếm", word:"one", phon:"/wʌn/", meaning:"một", example:"I have one book." },
  { id:"v12", level:1, topic:"Số đếm", word:"two", phon:"/tuː/", meaning:"hai", example:"I have two pens." },
  { id:"v13", level:1, topic:"Số đếm", word:"three", phon:"/θriː/", meaning:"ba", example:"There are three chairs." },
  { id:"v14", level:1, topic:"Số đếm", word:"ten", phon:"/ten/", meaning:"mười", example:"I have ten fingers." },
  { id:"v15", level:1, topic:"Số đếm", word:"hundred", phon:"/ˈhʌndrəd/", meaning:"một trăm", example:"There are a hundred students." },
  // Chủ đề: Màu sắc
  { id:"v16", level:1, topic:"Màu sắc", word:"red", phon:"/red/", meaning:"màu đỏ", example:"My car is red." },
  { id:"v17", level:1, topic:"Màu sắc", word:"blue", phon:"/bluː/", meaning:"màu xanh dương", example:"The sky is blue." },
  { id:"v18", level:1, topic:"Màu sắc", word:"green", phon:"/ɡriːn/", meaning:"màu xanh lá", example:"The leaves are green." },
  { id:"v19", level:1, topic:"Màu sắc", word:"black", phon:"/blæk/", meaning:"màu đen", example:"I have a black bag." },
  { id:"v20", level:1, topic:"Màu sắc", word:"white", phon:"/waɪt/", meaning:"màu trắng", example:"She wears a white shirt." },
  // Chủ đề: Ngày tháng
  { id:"v21", level:1, topic:"Ngày tháng", word:"Monday", phon:"/ˈmʌndeɪ/", meaning:"thứ Hai", example:"I go to school on Monday." },
  { id:"v22", level:1, topic:"Ngày tháng", word:"week", phon:"/wiːk/", meaning:"tuần", example:"There are seven days in a week." },
  { id:"v23", level:1, topic:"Ngày tháng", word:"month", phon:"/mʌnθ/", meaning:"tháng", example:"January is the first month." },
  { id:"v24", level:1, topic:"Ngày tháng", word:"year", phon:"/jɪər/", meaning:"năm", example:"I am ten years old." },
  { id:"v25", level:1, topic:"Ngày tháng", word:"birthday", phon:"/ˈbɜːrθdeɪ/", meaning:"sinh nhật", example:"My birthday is in May." },
  // Chủ đề: Đồ vật trong nhà
  { id:"v26", level:1, topic:"Đồ vật", word:"table", phon:"/ˈteɪbəl/", meaning:"cái bàn", example:"The book is on the table." },
  { id:"v27", level:1, topic:"Đồ vật", word:"chair", phon:"/tʃer/", meaning:"cái ghế", example:"Please sit on the chair." },
  { id:"v28", level:1, topic:"Đồ vật", word:"door", phon:"/dɔːr/", meaning:"cái cửa", example:"Close the door, please." },
  { id:"v29", level:1, topic:"Đồ vật", word:"bed", phon:"/bed/", meaning:"cái giường", example:"I sleep on my bed." },
  { id:"v30", level:1, topic:"Đồ vật", word:"window", phon:"/ˈwɪndoʊ/", meaning:"cửa sổ", example:"Open the window, please." },
  // Chủ đề: Cơ thể
  { id:"v31", level:1, topic:"Cơ thể", word:"head", phon:"/hed/", meaning:"đầu", example:"My head hurts." },
  { id:"v32", level:1, topic:"Cơ thể", word:"hand", phon:"/hænd/", meaning:"tay", example:"Wash your hands." },
  { id:"v33", level:1, topic:"Cơ thể", word:"eye", phon:"/aɪ/", meaning:"mắt", example:"She has blue eyes." },
  { id:"v34", level:1, topic:"Cơ thể", word:"leg", phon:"/leɡ/", meaning:"chân", example:"My leg is tired." },
  { id:"v35", level:1, topic:"Cơ thể", word:"mouth", phon:"/maʊθ/", meaning:"miệng", example:"Open your mouth." },
  // Chủ đề: Thời tiết
  { id:"v36", level:1, topic:"Thời tiết", word:"sun", phon:"/sʌn/", meaning:"mặt trời", example:"The sun is bright today." },
  { id:"v37", level:1, topic:"Thời tiết", word:"rain", phon:"/reɪn/", meaning:"mưa", example:"I like the sound of rain." },
  { id:"v38", level:1, topic:"Thời tiết", word:"hot", phon:"/hɑːt/", meaning:"nóng", example:"It is hot in summer." },
  { id:"v39", level:1, topic:"Thời tiết", word:"cold", phon:"/koʊld/", meaning:"lạnh", example:"It is cold in winter." },
  { id:"v40", level:1, topic:"Thời tiết", word:"wind", phon:"/wɪnd/", meaning:"gió", example:"The wind is strong today." },
  // Chủ đề: Trường học
  { id:"v41", level:1, topic:"Trường học", word:"school", phon:"/skuːl/", meaning:"trường học", example:"I go to school every day." },
  { id:"v42", level:1, topic:"Trường học", word:"book", phon:"/bʊk/", meaning:"sách", example:"I read a book every night." },
  { id:"v43", level:1, topic:"Trường học", word:"teacher", phon:"/ˈtiːtʃər/", meaning:"giáo viên", example:"My teacher is kind." },
  { id:"v44", level:1, topic:"Trường học", word:"student", phon:"/ˈstuːdənt/", meaning:"học sinh", example:"She is a good student." },
  { id:"v45", level:1, topic:"Trường học", word:"pen", phon:"/pen/", meaning:"cây bút", example:"Can I borrow your pen?" },

  // ========== LEVEL 2 — A2 ==========
  // Chủ đề: Công việc
  { id:"v46", level:2, topic:"Công việc", word:"job", phon:"/dʒɑːb/", meaning:"công việc", example:"She has a good job." },
  { id:"v47", level:2, topic:"Công việc", word:"office", phon:"/ˈɔːfɪs/", meaning:"văn phòng", example:"I work in an office." },
  { id:"v48", level:2, topic:"Công việc", word:"meeting", phon:"/ˈmiːtɪŋ/", meaning:"cuộc họp", example:"We have a meeting at 9 AM." },
  { id:"v49", level:2, topic:"Công việc", word:"busy", phon:"/ˈbɪzi/", meaning:"bận rộn", example:"I am busy today." },
  { id:"v50", level:2, topic:"Công việc", word:"salary", phon:"/ˈsæləri/", meaning:"lương", example:"My salary is good." },
  // Chủ đề: Du lịch
  { id:"v51", level:2, topic:"Du lịch", word:"travel", phon:"/ˈtrævəl/", meaning:"du lịch/đi lại", example:"I love to travel." },
  { id:"v52", level:2, topic:"Du lịch", word:"airport", phon:"/ˈerpɔːrt/", meaning:"sân bay", example:"The airport is far from here." },
  { id:"v53", level:2, topic:"Du lịch", word:"ticket", phon:"/ˈtɪkɪt/", meaning:"vé", example:"I bought a ticket online." },
  { id:"v54", level:2, topic:"Du lịch", word:"hotel", phon:"/hoʊˈtel/", meaning:"khách sạn", example:"We stayed in a nice hotel." },
  { id:"v55", level:2, topic:"Du lịch", word:"passport", phon:"/ˈpæspɔːrt/", meaning:"hộ chiếu", example:"Don't forget your passport." },
  // Chủ đề: Cảm xúc
  { id:"v56", level:2, topic:"Cảm xúc", word:"happy", phon:"/ˈhæpi/", meaning:"vui vẻ", example:"I am happy today." },
  { id:"v57", level:2, topic:"Cảm xúc", word:"tired", phon:"/ˈtaɪərd/", meaning:"mệt mỏi", example:"I am tired after work." },
  { id:"v58", level:2, topic:"Cảm xúc", word:"excited", phon:"/ɪkˈsaɪtɪd/", meaning:"phấn khích", example:"I am excited about the trip." },
  { id:"v59", level:2, topic:"Cảm xúc", word:"worried", phon:"/ˈwʌrid/", meaning:"lo lắng", example:"She is worried about the test." },
  { id:"v60", level:2, topic:"Cảm xúc", word:"angry", phon:"/ˈæŋɡri/", meaning:"tức giận", example:"He is angry at me." },
  // Chủ đề: Mua sắm
  { id:"v61", level:2, topic:"Mua sắm", word:"price", phon:"/praɪs/", meaning:"giá cả", example:"What is the price?" },
  { id:"v62", level:2, topic:"Mua sắm", word:"cheap", phon:"/tʃiːp/", meaning:"rẻ", example:"This shirt is cheap." },
  { id:"v63", level:2, topic:"Mua sắm", word:"expensive", phon:"/ɪkˈspensɪv/", meaning:"đắt", example:"That bag is expensive." },
  { id:"v64", level:2, topic:"Mua sắm", word:"discount", phon:"/ˈdɪskaʊnt/", meaning:"giảm giá", example:"There is a big discount." },
  { id:"v65", level:2, topic:"Mua sắm", word:"customer", phon:"/ˈkʌstəmər/", meaning:"khách hàng", example:"The customer is happy." },
  // Chủ đề: Sức khoẻ
  { id:"v66", level:2, topic:"Sức khoẻ", word:"sick", phon:"/sɪk/", meaning:"bị bệnh", example:"I feel sick today." },
  { id:"v67", level:2, topic:"Sức khoẻ", word:"medicine", phon:"/ˈmedəsɪn/", meaning:"thuốc", example:"Take this medicine twice a day." },
  { id:"v68", level:2, topic:"Sức khoẻ", word:"hospital", phon:"/ˈhɑːspɪtəl/", meaning:"bệnh viện", example:"She works at a hospital." },
  { id:"v69", level:2, topic:"Sức khoẻ", word:"exercise", phon:"/ˈeksərsaɪz/", meaning:"tập thể dục", example:"I exercise every morning." },
  { id:"v70", level:2, topic:"Sức khoẻ", word:"healthy", phon:"/ˈhelθi/", meaning:"khoẻ mạnh", example:"Eating vegetables is healthy." },
  // Chủ đề: Giao thông
  { id:"v71", level:2, topic:"Giao thông", word:"bus", phon:"/bʌs/", meaning:"xe buýt", example:"I take the bus to work." },
  { id:"v72", level:2, topic:"Giao thông", word:"traffic", phon:"/ˈtræfɪk/", meaning:"giao thông/kẹt xe", example:"The traffic is heavy today." },
  { id:"v73", level:2, topic:"Giao thông", word:"street", phon:"/striːt/", meaning:"con đường/phố", example:"My house is on this street." },
  { id:"v74", level:2, topic:"Giao thông", word:"drive", phon:"/draɪv/", meaning:"lái xe", example:"He drives to work every day." },
  { id:"v75", level:2, topic:"Giao thông", word:"station", phon:"/ˈsteɪʃən/", meaning:"nhà ga/trạm", example:"The train station is near my house." },
  // Chủ đề: Thời gian sinh hoạt
  { id:"v76", level:2, topic:"Thời gian", word:"today", phon:"/təˈdeɪ/", meaning:"hôm nay", example:"Today is Monday." },
  { id:"v77", level:2, topic:"Thời gian", word:"tomorrow", phon:"/təˈmɑːroʊ/", meaning:"ngày mai", example:"See you tomorrow." },
  { id:"v78", level:2, topic:"Thời gian", word:"yesterday", phon:"/ˈjestərdeɪ/", meaning:"hôm qua", example:"I was busy yesterday." },
  { id:"v79", level:2, topic:"Thời gian", word:"early", phon:"/ˈɜːrli/", meaning:"sớm", example:"I wake up early." },
  { id:"v80", level:2, topic:"Thời gian", word:"late", phon:"/leɪt/", meaning:"trễ/muộn", example:"Don't be late." },
  // Chủ đề: Nhà ở
  { id:"v81", level:2, topic:"Nhà ở", word:"apartment", phon:"/əˈpɑːrtmənt/", meaning:"căn hộ", example:"I live in a small apartment." },
  { id:"v82", level:2, topic:"Nhà ở", word:"neighbor", phon:"/ˈneɪbər/", meaning:"hàng xóm", example:"My neighbor is very friendly." },
  { id:"v83", level:2, topic:"Nhà ở", word:"kitchen", phon:"/ˈkɪtʃən/", meaning:"nhà bếp", example:"She is cooking in the kitchen." },
  { id:"v84", level:2, topic:"Nhà ở", word:"furniture", phon:"/ˈfɜːrnɪtʃər/", meaning:"đồ nội thất", example:"We bought new furniture." },
  { id:"v85", level:2, topic:"Nhà ở", word:"rent", phon:"/rent/", meaning:"tiền thuê nhà", example:"The rent is expensive here." },
  // Chủ đề: Thể thao & giải trí
  { id:"v86", level:2, topic:"Giải trí", word:"movie", phon:"/ˈmuːvi/", meaning:"phim", example:"We watched a movie last night." },
  { id:"v87", level:2, topic:"Giải trí", word:"music", phon:"/ˈmjuːzɪk/", meaning:"âm nhạc", example:"I listen to music every day." },
  { id:"v88", level:2, topic:"Giải trí", word:"sport", phon:"/spɔːrt/", meaning:"thể thao", example:"Football is my favorite sport." },
  { id:"v89", level:2, topic:"Giải trí", word:"game", phon:"/ɡeɪm/", meaning:"trò chơi", example:"They are playing a game." },
  { id:"v90", level:2, topic:"Giải trí", word:"weekend", phon:"/ˈwiːkend/", meaning:"cuối tuần", example:"I relax on the weekend." },

  // ========== LEVEL 3 — B1 ==========
  // Chủ đề: Môi trường
  { id:"v91", level:3, topic:"Môi trường", word:"environment", phon:"/ɪnˈvaɪrənmənt/", meaning:"môi trường", example:"We must protect the environment." },
  { id:"v92", level:3, topic:"Môi trường", word:"pollution", phon:"/pəˈluːʃən/", meaning:"ô nhiễm", example:"Air pollution is a big problem." },
  { id:"v93", level:3, topic:"Môi trường", word:"recycle", phon:"/riːˈsaɪkəl/", meaning:"tái chế", example:"We should recycle plastic bottles." },
  { id:"v94", level:3, topic:"Môi trường", word:"climate", phon:"/ˈklaɪmət/", meaning:"khí hậu", example:"Climate change affects everyone." },
  { id:"v95", level:3, topic:"Môi trường", word:"resource", phon:"/ˈriːsɔːrs/", meaning:"tài nguyên", example:"Water is a precious resource." },
  // Chủ đề: Công nghệ
  { id:"v96", level:3, topic:"Công nghệ", word:"device", phon:"/dɪˈvaɪs/", meaning:"thiết bị", example:"This device is very useful." },
  { id:"v97", level:3, topic:"Công nghệ", word:"software", phon:"/ˈsɔːftwer/", meaning:"phần mềm", example:"I need to update this software." },
  { id:"v98", level:3, topic:"Công nghệ", word:"upload", phon:"/ˈʌploʊd/", meaning:"tải lên", example:"Please upload your document." },
  { id:"v99", level:3, topic:"Công nghệ", word:"connection", phon:"/kəˈnekʃən/", meaning:"kết nối", example:"My internet connection is slow." },
  { id:"v100", level:3, topic:"Công nghệ", word:"innovation", phon:"/ˌɪnəˈveɪʃən/", meaning:"sự đổi mới/sáng tạo", example:"This company is known for innovation." },
  // Chủ đề: Giáo dục
  { id:"v101", level:3, topic:"Giáo dục", word:"knowledge", phon:"/ˈnɑːlɪdʒ/", meaning:"kiến thức", example:"Reading increases your knowledge." },
  { id:"v102", level:3, topic:"Giáo dục", word:"university", phon:"/ˌjuːnɪˈvɜːrsəti/", meaning:"đại học", example:"She studies at a university." },
  { id:"v103", level:3, topic:"Giáo dục", word:"degree", phon:"/dɪˈɡriː/", meaning:"văn bằng/bằng cấp", example:"He has a degree in economics." },
  { id:"v104", level:3, topic:"Giáo dục", word:"skill", phon:"/skɪl/", meaning:"kỹ năng", example:"Communication is an important skill." },
  { id:"v105", level:3, topic:"Giáo dục", word:"research", phon:"/rɪˈsɜːrtʃ/", meaning:"nghiên cứu", example:"This research took two years." },
  // Chủ đề: Quan hệ xã hội
  { id:"v106", level:3, topic:"Quan hệ", word:"relationship", phon:"/rɪˈleɪʃənʃɪp/", meaning:"mối quan hệ", example:"They have a close relationship." },
  { id:"v107", level:3, topic:"Quan hệ", word:"trust", phon:"/trʌst/", meaning:"sự tin tưởng", example:"Trust is important in a friendship." },
  { id:"v108", level:3, topic:"Quan hệ", word:"support", phon:"/səˈpɔːrt/", meaning:"sự hỗ trợ/ủng hộ", example:"My family always supports me." },
  { id:"v109", level:3, topic:"Quan hệ", word:"conflict", phon:"/ˈkɑːnflɪkt/", meaning:"xung đột/mâu thuẫn", example:"They had a conflict about money." },
  { id:"v110", level:3, topic:"Quan hệ", word:"community", phon:"/kəˈmjuːnəti/", meaning:"cộng đồng", example:"He is active in his community." },
  // Chủ đề: Ý kiến cá nhân
  { id:"v111", level:3, topic:"Ý kiến", word:"opinion", phon:"/əˈpɪnjən/", meaning:"ý kiến", example:"In my opinion, this is a good idea." },
  { id:"v112", level:3, topic:"Ý kiến", word:"agree", phon:"/əˈɡriː/", meaning:"đồng ý", example:"I agree with your point." },
  { id:"v113", level:3, topic:"Ý kiến", word:"disagree", phon:"/ˌdɪsəˈɡriː/", meaning:"không đồng ý", example:"I disagree with that decision." },
  { id:"v114", level:3, topic:"Ý kiến", word:"argument", phon:"/ˈɑːrɡjumənt/", meaning:"lý lẽ/cuộc tranh luận", example:"That is a strong argument." },
  { id:"v115", level:3, topic:"Ý kiến", word:"perspective", phon:"/pərˈspektɪv/", meaning:"góc nhìn/quan điểm", example:"Try to see it from her perspective." },
  // Chủ đề: Sự nghiệp
  { id:"v116", level:3, topic:"Sự nghiệp", word:"experience", phon:"/ɪkˈspɪriəns/", meaning:"kinh nghiệm", example:"She has five years of experience." },
  { id:"v117", level:3, topic:"Sự nghiệp", word:"promotion", phon:"/prəˈmoʊʃən/", meaning:"thăng tiến", example:"He got a promotion last month." },
  { id:"v118", level:3, topic:"Sự nghiệp", word:"responsibility", phon:"/rɪˌspɑːnsəˈbɪləti/", meaning:"trách nhiệm", example:"This job has a lot of responsibility." },
  { id:"v119", level:3, topic:"Sự nghiệp", word:"goal", phon:"/ɡoʊl/", meaning:"mục tiêu", example:"My goal is to learn English well." },
  { id:"v120", level:3, topic:"Sự nghiệp", word:"achieve", phon:"/əˈtʃiːv/", meaning:"đạt được", example:"She achieved her dream job." },
  // Chủ đề: Văn hoá
  { id:"v121", level:3, topic:"Văn hoá", word:"tradition", phon:"/trəˈdɪʃən/", meaning:"truyền thống", example:"This festival is an old tradition." },
  { id:"v122", level:3, topic:"Văn hoá", word:"custom", phon:"/ˈkʌstəm/", meaning:"phong tục", example:"It is a local custom to remove shoes." },
  { id:"v123", level:3, topic:"Văn hoá", word:"festival", phon:"/ˈfestəvəl/", meaning:"lễ hội", example:"The festival happens every spring." },
  { id:"v124", level:3, topic:"Văn hoá", word:"generation", phon:"/ˌdʒenəˈreɪʃən/", meaning:"thế hệ", example:"Each generation has different values." },
  { id:"v125", level:3, topic:"Văn hoá", word:"value", phon:"/ˈvæljuː/", meaning:"giá trị", example:"Honesty is an important value." },
  // Chủ đề: Sức khoẻ tâm lý
  { id:"v126", level:3, topic:"Tâm lý", word:"stress", phon:"/stres/", meaning:"căng thẳng", example:"Work can cause a lot of stress." },
  { id:"v127", level:3, topic:"Tâm lý", word:"relax", phon:"/rɪˈlæks/", meaning:"thư giãn", example:"I relax by reading books." },
  { id:"v128", level:3, topic:"Tâm lý", word:"confidence", phon:"/ˈkɑːnfɪdəns/", meaning:"sự tự tin", example:"Practice builds your confidence." },
  { id:"v129", level:3, topic:"Tâm lý", word:"motivation", phon:"/ˌmoʊtɪˈveɪʃən/", meaning:"động lực", example:"She lost her motivation to study." },
  { id:"v130", level:3, topic:"Tâm lý", word:"balance", phon:"/ˈbæləns/", meaning:"sự cân bằng", example:"It's important to balance work and rest." },

  // ========== LEVEL 4 — B2 ==========
  // Chủ đề: Kinh tế
  { id:"v131", level:4, topic:"Kinh tế", word:"economy", phon:"/ɪˈkɑːnəmi/", meaning:"kinh tế", example:"The economy is growing fast." },
  { id:"v132", level:4, topic:"Kinh tế", word:"investment", phon:"/ɪnˈvestmənt/", meaning:"sự đầu tư", example:"This is a risky investment." },
  { id:"v133", level:4, topic:"Kinh tế", word:"inflation", phon:"/ɪnˈfleɪʃən/", meaning:"lạm phát", example:"Inflation affects everyone's budget." },
  { id:"v134", level:4, topic:"Kinh tế", word:"revenue", phon:"/ˈrevənuː/", meaning:"doanh thu", example:"The company's revenue increased." },
  { id:"v135", level:4, topic:"Kinh tế", word:"competitive", phon:"/kəmˈpetətɪv/", meaning:"có tính cạnh tranh", example:"This market is very competitive." },
  // Chủ đề: Tranh luận & thuyết phục
  { id:"v136", level:4, topic:"Tranh luận", word:"controversial", phon:"/ˌkɑːntrəˈvɜːrʃəl/", meaning:"gây tranh cãi", example:"This is a controversial topic." },
  { id:"v137", level:4, topic:"Tranh luận", word:"evidence", phon:"/ˈevɪdəns/", meaning:"bằng chứng", example:"There is no evidence to support that claim." },
  { id:"v138", level:4, topic:"Tranh luận", word:"assumption", phon:"/əˈsʌmpʃən/", meaning:"sự giả định", example:"That's just an assumption, not a fact." },
  { id:"v139", level:4, topic:"Tranh luận", word:"persuade", phon:"/pərˈsweɪd/", meaning:"thuyết phục", example:"She persuaded him to change his mind." },
  { id:"v140", level:4, topic:"Tranh luận", word:"compromise", phon:"/ˈkɑːmprəmaɪz/", meaning:"sự thoả hiệp", example:"They reached a compromise." },
  // Chủ đề: Xã hội & chính sách
  { id:"v141", level:4, topic:"Xã hội", word:"policy", phon:"/ˈpɑːləsi/", meaning:"chính sách", example:"The new policy affects all employees." },
  { id:"v142", level:4, topic:"Xã hội", word:"inequality", phon:"/ˌɪnɪˈkwɑːləti/", meaning:"sự bất bình đẳng", example:"Income inequality is a major issue." },
  { id:"v143", level:4, topic:"Xã hội", word:"regulation", phon:"/ˌreɡjuˈleɪʃən/", meaning:"quy định", example:"New regulations were introduced this year." },
  { id:"v144", level:4, topic:"Xã hội", word:"awareness", phon:"/əˈwernəs/", meaning:"sự nhận thức", example:"We need to raise public awareness." },
  { id:"v145", level:4, topic:"Xã hội", word:"sustainable", phon:"/səˈsteɪnəbəl/", meaning:"bền vững", example:"We need more sustainable solutions." },
  // Chủ đề: Học thuật
  { id:"v146", level:4, topic:"Học thuật", word:"analyze", phon:"/ˈænəlaɪz/", meaning:"phân tích", example:"We need to analyze this data carefully." },
  { id:"v147", level:4, topic:"Học thuật", word:"hypothesis", phon:"/haɪˈpɑːθəsɪs/", meaning:"giả thuyết", example:"The scientist tested her hypothesis." },
  { id:"v148", level:4, topic:"Học thuật", word:"significant", phon:"/sɪɡˈnɪfɪkənt/", meaning:"đáng kể/quan trọng", example:"There was a significant improvement." },
  { id:"v149", level:4, topic:"Học thuật", word:"approach", phon:"/əˈproʊtʃ/", meaning:"cách tiếp cận", example:"This is a new approach to the problem." },
  { id:"v150", level:4, topic:"Học thuật", word:"contribute", phon:"/kənˈtrɪbjuːt/", meaning:"góp phần/đóng góp", example:"Many factors contribute to success." },
  // Chủ đề: Idiom & cách diễn đạt thông dụng
  { id:"v151", level:4, topic:"Idioms", word:"break the ice", phon:"/breɪk ði aɪs/", meaning:"phá vỡ sự im lặng/ngại ngùng ban đầu", example:"He told a joke to break the ice." },
  { id:"v152", level:4, topic:"Idioms", word:"get the hang of", phon:"/ɡet ðə hæŋ ʌv/", meaning:"bắt đầu thành thạo việc gì", example:"I finally got the hang of driving." },
  { id:"v153", level:4, topic:"Idioms", word:"on the same page", phon:"/ɑːn ðə seɪm peɪdʒ/", meaning:"có cùng quan điểm/hiểu nhau", example:"Let's make sure we're on the same page." },
  { id:"v154", level:4, topic:"Idioms", word:"under the weather", phon:"/ˈʌndər ðə ˈweðər/", meaning:"cảm thấy không khoẻ", example:"I'm feeling a bit under the weather today." },
  { id:"v155", level:4, topic:"Idioms", word:"think outside the box", phon:"/θɪŋk aʊtˈsaɪd ðə bɑːks/", meaning:"suy nghĩ sáng tạo, khác biệt", example:"We need to think outside the box." },
  // Chủ đề: Truyền thông
  { id:"v156", level:4, topic:"Truyền thông", word:"media", phon:"/ˈmiːdiə/", meaning:"truyền thông", example:"Social media affects how we think." },
  { id:"v157", level:4, topic:"Truyền thông", word:"influence", phon:"/ˈɪnfluəns/", meaning:"ảnh hưởng", example:"Advertising has a strong influence on us." },
  { id:"v158", level:4, topic:"Truyền thông", word:"credible", phon:"/ˈkredəbəl/", meaning:"đáng tin cậy", example:"Make sure your source is credible." },
  { id:"v159", level:4, topic:"Truyền thông", word:"broadcast", phon:"/ˈbrɔːdkæst/", meaning:"phát sóng", example:"The match was broadcast live." },
  { id:"v160", level:4, topic:"Truyền thông", word:"bias", phon:"/ˈbaɪəs/", meaning:"sự thiên vị/định kiến", example:"This article shows clear bias." },
];

const GRAMMAR_DATA = [
  // ===== LEVEL 1 — A1: to be, hiện tại đơn, số nhiều, mạo từ =====
  { id:"g1", level:1, question:"I ___ a student.", options:["am","is","are","be"], answer:0, note:"Chủ ngữ 'I' đi với 'am'." },
  { id:"g2", level:1, question:"She ___ to school every day.", options:["go","goes","going","went"], answer:1, note:"Ngôi thứ 3 số ít + thêm 's/es' ở thì hiện tại đơn." },
  { id:"g3", level:1, question:"They ___ watching TV now.", options:["is","am","are","be"], answer:2, note:"'They' là số nhiều, dùng 'are'." },
  { id:"g4", level:1, question:"___ you like coffee?", options:["Do","Does","Are","Is"], answer:0, note:"Câu hỏi Yes/No với 'you' dùng 'Do'." },
  { id:"g5", level:1, question:"There ___ a cat under the table.", options:["is","are","be","am"], answer:0, note:"'A cat' là danh từ số ít, dùng 'is'." },
  { id:"g6", level:1, question:"This is ___ apple.", options:["a","an","the","--"], answer:1, note:"Trước nguyên âm (a,e,i,o,u) dùng 'an'." },
  { id:"g7", level:1, question:"I have two ___.", options:["book","books","a book","the book"], answer:1, note:"Số nhiều của danh từ đếm được thêm 's'." },
  { id:"g8", level:1, question:"He ___ a doctor.", options:["am","is","are","be"], answer:1, note:"Chủ ngữ 'He' đi với 'is'." },
  { id:"g9", level:1, question:"We ___ from Vietnam.", options:["am","is","are","be"], answer:2, note:"Chủ ngữ 'We' đi với 'are'." },
  { id:"g10", level:1, question:"My sister ___ TV every evening.", options:["watch","watches","watching","watched"], answer:1, note:"Ngôi thứ 3 số ít thêm '-es' với động từ kết thúc bằng 'ch'." },
  { id:"g11", level:1, question:"___ they happy?", options:["Do","Does","Is","Are"], answer:3, note:"Câu hỏi với 'they' và tính từ dùng 'Are'." },
  { id:"g12", level:1, question:"I don't ___ meat.", options:["eat","eats","ate","eating"], answer:0, note:"Sau 'don't' dùng động từ nguyên thể." },
  { id:"g13", level:1, question:"There ___ many students in this class.", options:["is","are","be","am"], answer:1, note:"'Students' số nhiều dùng 'are'." },
  { id:"g14", level:1, question:"She ___ not like fish.", options:["do","does","is","are"], answer:1, note:"Phủ định ngôi thứ 3 số ít dùng 'does not'." },
  { id:"g15", level:1, question:"This is ___ house.", options:["I","my","me","mine"], answer:1, note:"Tính từ sở hữu 'my' đứng trước danh từ." },

  // ===== LEVEL 2 — A2: quá khứ đơn, so sánh, tương lai, hiện tại tiếp diễn =====
  { id:"g16", level:2, question:"He ___ at home yesterday.", options:["is","was","were","be"], answer:1, note:"Quá khứ đơn của 'is/am' là 'was'." },
  { id:"g17", level:2, question:"We ___ to the cinema last night.", options:["go","goes","went","going"], answer:2, note:"Quá khứ đơn của 'go' là 'went'." },
  { id:"g18", level:2, question:"My sister is ___ than me.", options:["tall","taller","tallest","more tall"], answer:1, note:"So sánh hơn với tính từ ngắn: thêm '-er'." },
  { id:"g19", level:2, question:"This book is ___ than that one.", options:["interesting","more interesting","most interesting","interestinger"], answer:1, note:"So sánh hơn với tính từ dài: 'more + adj'." },
  { id:"g20", level:2, question:"I ___ visit my grandmother next week.", options:["will","would","am","was"], answer:0, note:"Thì tương lai đơn: 'will + V'." },
  { id:"g21", level:2, question:"She is ___ a letter right now.", options:["write","writes","writing","wrote"], answer:2, note:"Hiện tại tiếp diễn: am/is/are + V-ing." },
  { id:"g22", level:2, question:"Did you ___ the movie last weekend?", options:["watch","watched","watching","watches"], answer:0, note:"Sau 'did' dùng động từ nguyên thể." },
  { id:"g23", level:2, question:"He is the ___ student in the class.", options:["good","better","best","goodest"], answer:2, note:"So sánh nhất của 'good' là 'best'." },
  { id:"g24", level:2, question:"I ___ swimming when I was young.", options:["go","goes","went","going"], answer:2, note:"Quá khứ đơn diễn tả hành động đã xảy ra và kết thúc." },
  { id:"g25", level:2, question:"They are going to ___ a new house.", options:["buy","buys","bought","buying"], answer:0, note:"Cấu trúc 'be going to + V nguyên thể' diễn tả dự định." },
  { id:"g26", level:2, question:"She ___ TV when I called her.", options:["watch","watches","was watching","watched"], answer:2, note:"Quá khứ tiếp diễn: was/were + V-ing, diễn tả hành động đang xảy ra." },
  { id:"g27", level:2, question:"This is the ___ city I have ever visited.", options:["big","bigger","biggest","more big"], answer:2, note:"So sánh nhất với tính từ ngắn: 'the + adj-est'." },
  { id:"g28", level:2, question:"I have ___ money than him.", options:["less","fewer","little","few"], answer:0, note:"'Money' là danh từ không đếm được, dùng 'less'." },
  { id:"g29", level:2, question:"We ___ dinner at 7 PM yesterday.", options:["have","has","had","having"], answer:2, note:"Quá khứ đơn của 'have' là 'had'." },
  { id:"g30", level:2, question:"Can you ___ me your pen?", options:["lend","lending","lent","lends"], answer:0, note:"Sau động từ khuyết thiếu 'can' dùng động từ nguyên thể." },

  // ===== LEVEL 3 — B1: hiện tại hoàn thành, điều kiện 1&2, mệnh đề quan hệ =====
  { id:"g31", level:3, question:"I ___ finished my homework yet.", options:["don't","didn't","haven't","isn't"], answer:2, note:"Thì hiện tại hoàn thành phủ định: 'haven't + V3'." },
  { id:"g32", level:3, question:"He ___ English for 3 years.", options:["studies","studied","has studied","study"], answer:2, note:"Hiện tại hoàn thành diễn tả hành động kéo dài đến hiện tại." },
  { id:"g33", level:3, question:"If it rains, I ___ stay home.", options:["will","would","am","was"], answer:0, note:"Câu điều kiện loại 1: 'If + hiện tại đơn, will + V'." },
  { id:"g34", level:3, question:"If I had more money, I ___ travel the world.", options:["will","would","am","was"], answer:1, note:"Câu điều kiện loại 2: 'If + quá khứ đơn, would + V'." },
  { id:"g35", level:3, question:"The woman ___ lives next door is a doctor.", options:["who","which","whose","where"], answer:0, note:"Mệnh đề quan hệ chỉ người dùng 'who'." },
  { id:"g36", level:3, question:"This is the book ___ I told you about.", options:["who","which","whose","where"], answer:1, note:"Mệnh đề quan hệ chỉ vật dùng 'which' hoặc 'that'." },
  { id:"g37", level:3, question:"She is interested ___ music.", options:["on","in","at","with"], answer:1, note:"Cụm từ cố định: 'be interested in'." },
  { id:"g38", level:3, question:"Have you ever ___ to Japan?", options:["go","went","been","being"], answer:2, note:"Hiện tại hoàn thành với 'been' diễn tả trải nghiệm đã từng." },
  { id:"g39", level:3, question:"If she studied harder, she ___ pass the exam.", options:["will","would","can","is"], answer:1, note:"Câu điều kiện loại 2 diễn tả tình huống giả định không thật ở hiện tại." },
  { id:"g40", level:3, question:"This is the house ___ I grew up.", options:["who","which","where","whose"], answer:2, note:"Mệnh đề quan hệ chỉ nơi chốn dùng 'where'." },
  { id:"g41", level:3, question:"We ___ already eaten dinner.", options:["have","has","had","having"], answer:0, note:"Chủ ngữ 'we' với hiện tại hoàn thành dùng 'have'." },
  { id:"g42", level:3, question:"I ___ never seen such a beautiful place.", options:["am","have","was","did"], answer:1, note:"Hiện tại hoàn thành: 'have + never + V3'." },
  { id:"g43", level:3, question:"Unless you study, you ___ fail the test.", options:["will","would","won't","wouldn't"], answer:0, note:"'Unless' = 'if not', theo sau là cấu trúc điều kiện loại 1." },
  { id:"g44", level:3, question:"She has ___ finished her project.", options:["already","yet","still","ago"], answer:0, note:"'Already' thường dùng trong câu khẳng định ở hiện tại hoàn thành." },
  { id:"g45", level:3, question:"The man ___ car was stolen called the police.", options:["who","which","whose","where"], answer:2, note:"Mệnh đề quan hệ chỉ sự sở hữu dùng 'whose'." },

  // ===== LEVEL 4 — B2: điều kiện 3, bị động, câu gián tiếp, mệnh đề trạng ngữ =====
  { id:"g46", level:4, question:"If I had known about the meeting, I ___ attended it.", options:["will have","would have","would","will"], answer:1, note:"Câu điều kiện loại 3: 'If + quá khứ hoàn thành, would have + V3'." },
  { id:"g47", level:4, question:"The report ___ by the manager yesterday.", options:["wrote","was written","is written","writes"], answer:1, note:"Câu bị động ở thì quá khứ: 'was/were + V3'." },
  { id:"g48", level:4, question:"She said that she ___ tired.", options:["is","was","be","being"], answer:1, note:"Câu gián tiếp: lùi thì từ hiện tại sang quá khứ." },
  { id:"g49", level:4, question:"Although it was raining, they ___ the game.", options:["finish","finished","were finishing","had finished"], answer:1, note:"'Although' giới thiệu mệnh đề trạng ngữ chỉ sự nhượng bộ." },
  { id:"g50", level:4, question:"This building ___ in 1990.", options:["built","was built","builds","is building"], answer:1, note:"Câu bị động diễn tả hành động đã hoàn thành trong quá khứ." },
  { id:"g51", level:4, question:"He asked me where I ___ from.", options:["am","was","is","were"], answer:1, note:"Câu gián tiếp lùi thì 'am' thành 'was'." },
  { id:"g52", level:4, question:"If she ___ harder, she would have passed the exam.", options:["studied","had studied","studies","would study"], answer:1, note:"Câu điều kiện loại 3 dùng quá khứ hoàn thành ở mệnh đề if." },
  { id:"g53", level:4, question:"By the time we arrived, the movie ___ already started.", options:["has","have","had","was"], answer:2, note:"Quá khứ hoàn thành diễn tả hành động xảy ra trước một thời điểm trong quá khứ." },
  { id:"g54", level:4, question:"The cake ___ by my mother every birthday.", options:["make","makes","is made","was making"], answer:2, note:"Câu bị động ở hiện tại đơn: 'is/are + V3'." },
  { id:"g55", level:4, question:"Despite ___ tired, she finished the marathon.", options:["be","being","was","is"], answer:1, note:"Sau giới từ 'despite' dùng V-ing (danh động từ)." },
  { id:"g56", level:4, question:"He told me that he ___ the work by Friday.", options:["will finish","would finish","finishes","finish"], answer:1, note:"Câu gián tiếp: 'will' lùi thành 'would'." },
  { id:"g57", level:4, question:"Not only ___ she smart, but she is also hardworking.", options:["is","was","does","is is"], answer:0, note:"Đảo ngữ với 'Not only... but also' yêu cầu trợ động từ đứng trước chủ ngữ." },
  { id:"g58", level:4, question:"The problem ___ being discussed when I arrived.", options:["was","is","has been","were"], answer:0, note:"Bị động ở thì quá khứ tiếp diễn: 'was/were + being + V3'." },
  { id:"g59", level:4, question:"I wish I ___ more time to finish this project.", options:["have","had","will have","having"], answer:1, note:"'Wish' + quá khứ đơn diễn tả điều không thật ở hiện tại." },
  { id:"g60", level:4, question:"As soon as he ___ home, he called his mother.", options:["get","gets","got","getting"], answer:2, note:"'As soon as' + quá khứ đơn diễn tả hành động xảy ra ngay sau một hành động khác." },
];

const LISTEN_DATA = [
  // ===== LEVEL 1 — A1 =====
  { id:"l1", level:1, text:"Hello, my name is ___. I am from Vietnam.", answer:"Anna", full:"Hello, my name is Anna. I am from Vietnam." },
  { id:"l2", level:1, text:"I wake up at ___ every morning.", answer:"six", full:"I wake up at six every morning." },
  { id:"l3", level:1, text:"My favorite food is ___.", answer:"pizza", full:"My favorite food is pizza." },
  { id:"l4", level:1, text:"I have a small ___.", answer:"family", full:"I have a small family." },
  { id:"l5", level:1, text:"This is my ___ pen.", answer:"red", full:"This is my red pen." },
  { id:"l6", level:1, text:"I am ___ years old.", answer:"ten", full:"I am ten years old." },
  { id:"l7", level:1, text:"Today is ___.", answer:"Monday", full:"Today is Monday." },
  { id:"l8", level:1, text:"My ___ hurts a little.", answer:"head", full:"My head hurts a little." },
  { id:"l9", level:1, text:"It is very ___ today.", answer:"hot", full:"It is very hot today." },
  { id:"l10", level:1, text:"I go to ___ every day.", answer:"school", full:"I go to school every day." },

  // ===== LEVEL 2 — A2 =====
  { id:"l11", level:2, text:"It is ___ today, so I will stay home.", answer:"raining", full:"It is raining today, so I will stay home." },
  { id:"l12", level:2, text:"She works as a ___ at the hospital.", answer:"nurse", full:"She works as a nurse at the hospital." },
  { id:"l13", level:2, text:"We are going to the ___ this weekend.", answer:"beach", full:"We are going to the beach this weekend." },
  { id:"l14", level:2, text:"Can you please close the ___?", answer:"window", full:"Can you please close the window?" },
  { id:"l15", level:2, text:"I need to buy some ___ from the store.", answer:"milk", full:"I need to buy some milk from the store." },
  { id:"l16", level:2, text:"He felt very ___ after the long trip.", answer:"tired", full:"He felt very tired after the long trip." },
  { id:"l17", level:2, text:"I bought this jacket because it was on ___.", answer:"discount", full:"I bought this jacket because it was on discount." },
  { id:"l18", level:2, text:"The traffic was really ___ this morning.", answer:"heavy", full:"The traffic was really heavy this morning." },
  { id:"l19", level:2, text:"Please take this ___ twice a day.", answer:"medicine", full:"Please take this medicine twice a day." },
  { id:"l20", level:2, text:"My new apartment has a small ___.", answer:"kitchen", full:"My new apartment has a small kitchen." },

  // ===== LEVEL 3 — B1 =====
  { id:"l21", level:3, text:"We should all try to ___ plastic bottles.", answer:"recycle", full:"We should all try to recycle plastic bottles." },
  { id:"l22", level:3, text:"In my ___, this plan will not work.", answer:"opinion", full:"In my opinion, this plan will not work." },
  { id:"l23", level:3, text:"She has five years of ___ in marketing.", answer:"experience", full:"She has five years of experience in marketing." },
  { id:"l24", level:3, text:"This festival is part of our local ___.", answer:"tradition", full:"This festival is part of our local tradition." },
  { id:"l25", level:3, text:"Work can sometimes cause a lot of ___.", answer:"stress", full:"Work can sometimes cause a lot of stress." },
  { id:"l26", level:3, text:"My internet ___ has been very slow lately.", answer:"connection", full:"My internet connection has been very slow lately." },
  { id:"l27", level:3, text:"Trust is very important in any ___.", answer:"relationship", full:"Trust is very important in any relationship." },
  { id:"l28", level:3, text:"He finally got a ___ after three years at the company.", answer:"promotion", full:"He finally got a promotion after three years at the company." },
  { id:"l29", level:3, text:"It's important to ___ work and rest.", answer:"balance", full:"It's important to balance work and rest." },
  { id:"l30", level:3, text:"Reading every day really increases your ___.", answer:"knowledge", full:"Reading every day really increases your knowledge." },

  // ===== LEVEL 4 — B2 =====
  { id:"l31", level:4, text:"The country's ___ has been growing steadily this year.", answer:"economy", full:"The country's economy has been growing steadily this year." },
  { id:"l32", level:4, text:"This is a very ___ topic, so let's be careful.", answer:"controversial", full:"This is a very controversial topic, so let's be careful." },
  { id:"l33", level:4, text:"There is no solid ___ to support that claim.", answer:"evidence", full:"There is no solid evidence to support that claim." },
  { id:"l34", level:4, text:"We need to raise public ___ about this issue.", answer:"awareness", full:"We need to raise public awareness about this issue." },
  { id:"l35", level:4, text:"They finally reached a ___ after a long discussion.", answer:"compromise", full:"They finally reached a compromise after a long discussion." },
  { id:"l36", level:4, text:"Make sure your information comes from a ___ source.", answer:"credible", full:"Make sure your information comes from a credible source." },
  { id:"l37", level:4, text:"He told a joke to ___ the ice at the meeting.", answer:"break", full:"He told a joke to break the ice at the meeting." },
  { id:"l38", level:4, text:"It took me a while to ___ the hang of this software.", answer:"get", full:"It took me a while to get the hang of this software." },
  { id:"l39", level:4, text:"Many factors ___ to a company's success.", answer:"contribute", full:"Many factors contribute to a company's success." },
  { id:"l40", level:4, text:"We need more ___ solutions for the environment.", answer:"sustainable", full:"We need more sustainable solutions for the environment." },
];

const SPEAK_DATA = [
  // ===== LEVEL 1 — A1 =====
  { id:"s1", level:1, text:"Good morning, how are you today?" },
  { id:"s2", level:1, text:"My name is Linh. Nice to meet you." },
  { id:"s3", level:1, text:"I have one sister and one brother." },
  { id:"s4", level:1, text:"I like to eat rice and vegetables." },
  { id:"s5", level:1, text:"My favorite color is blue." },
  { id:"s6", level:1, text:"Today is Monday and it is sunny." },
  { id:"s7", level:1, text:"I go to school every morning." },
  { id:"s8", level:1, text:"This is my book and that is my pen." },
  { id:"s9", level:1, text:"I am ten years old." },
  { id:"s10", level:1, text:"Can you open the window, please?" },

  // ===== LEVEL 2 — A2 =====
  { id:"s11", level:2, text:"I would like a cup of coffee, please." },
  { id:"s12", level:2, text:"What time does the train leave?" },
  { id:"s13", level:2, text:"Could you tell me the way to the station?" },
  { id:"s14", level:2, text:"I have been working here for two years." },
  { id:"s15", level:2, text:"This restaurant has very delicious food." },
  { id:"s16", level:2, text:"I went to the beach with my family last weekend." },
  { id:"s17", level:2, text:"She felt happy when she got the new job." },
  { id:"s18", level:2, text:"How much does this jacket cost?" },
  { id:"s19", level:2, text:"I usually take the bus to work every day." },
  { id:"s20", level:2, text:"My apartment is small but very comfortable." },

  // ===== LEVEL 3 — B1 =====
  { id:"s21", level:3, text:"In my opinion, we should protect the environment more." },
  { id:"s22", level:3, text:"I have never visited a place as beautiful as this." },
  { id:"s23", level:3, text:"If I had more free time, I would learn a new skill." },
  { id:"s24", level:3, text:"Trust and communication are important in any relationship." },
  { id:"s25", level:3, text:"She has five years of experience working in marketing." },
  { id:"s26", level:3, text:"It's important to balance work and personal life." },
  { id:"s27", level:3, text:"I disagree with that opinion, but I respect it." },
  { id:"s28", level:3, text:"This tradition has been passed down for generations." },
  { id:"s29", level:3, text:"He finally achieved his goal after years of hard work." },
  { id:"s30", level:3, text:"Reading books every day really improves your knowledge." },

  // ===== LEVEL 4 — B2 =====
  { id:"s31", level:4, text:"The economy has been growing steadily over the past year." },
  { id:"s32", level:4, text:"This is a controversial issue with no easy solution." },
  { id:"s33", level:4, text:"There isn't enough evidence to support this argument yet." },
  { id:"s34", level:4, text:"We need to think outside the box to solve this problem." },
  { id:"s35", level:4, text:"If I had known earlier, I would have made a different choice." },
  { id:"s36", level:4, text:"Many factors contribute to a company's long-term success." },
  { id:"s37", level:4, text:"It's important to raise awareness about climate change." },
  { id:"s38", level:4, text:"They eventually reached a compromise after a long negotiation." },
  { id:"s39", level:4, text:"Although it was difficult, she managed to finish the project on time." },
  { id:"s40", level:4, text:"We should rely on credible sources when forming an opinion." },
];

// ============ ROLEPLAY: AI ĐÓNG VAI HỘI THOẠI (dùng trong tab Nói) ============
// Mỗi tình huống có: role (AI đóng vai gì), scenario (mô tả ngữ cảnh),
// opener (câu AI mở đầu hội thoại) — phù hợp độ khó theo level.
const ROLEPLAY_DATA = [
  // ===== LEVEL 1 — A1 =====
  { id:"r1", level:1, icon:"🛒", role:"nhân viên cửa hàng", scenario:"Bạn đang mua đồ ở một cửa hàng nhỏ.", opener:"Hello! Welcome to our shop. What would you like to buy today?" },
  { id:"r2", level:1, icon:"🍽️", role:"nhân viên nhà hàng", scenario:"Bạn đang gọi món tại một nhà hàng.", opener:"Good evening! Are you ready to order? What would you like to eat?" },
  { id:"r3", level:1, icon:"🏫", role:"giáo viên mới gặp", scenario:"Bạn gặp một giáo viên mới ở trường.", opener:"Hi there! I'm your new teacher. What is your name?" },
  { id:"r4", level:1, icon:"👋", role:"người bạn mới", scenario:"Bạn gặp một người bạn mới lần đầu.", opener:"Hi! Nice to meet you. Where are you from?" },

  // ===== LEVEL 2 — A2 =====
  { id:"r5", level:2, icon:"🏨", role:"nhân viên lễ tân khách sạn", scenario:"Bạn đang nhận phòng tại một khách sạn.", opener:"Good afternoon! Welcome to our hotel. Do you have a reservation?" },
  { id:"r6", level:2, icon:"🚕", role:"lái xe taxi", scenario:"Bạn vừa lên một chiếc taxi.", opener:"Hello! Where would you like to go today?" },
  { id:"r7", level:2, icon:"💼", role:"đồng nghiệp mới", scenario:"Bạn vừa bắt đầu công việc mới và gặp đồng nghiệp.", opener:"Hi, welcome to the team! How was your first day so far?" },
  { id:"r8", level:2, icon:"🏥", role:"y tá tại phòng khám", scenario:"Bạn đến khám bệnh tại một phòng khám.", opener:"Hello! What seems to be the problem today?" },

  // ===== LEVEL 3 — B1 =====
  { id:"r9", level:3, icon:"✈️", role:"nhân viên hải quan", scenario:"Bạn đang nhập cảnh ở sân bay.", opener:"Good morning. What is the purpose of your visit, and how long will you be staying?" },
  { id:"r10", level:3, icon:"🏠", role:"chủ nhà cho thuê", scenario:"Bạn đang hỏi thuê một căn nhà.", opener:"Hi! Thanks for your interest in the apartment. What are you looking for exactly?" },
  { id:"r11", level:3, icon:"🎓", role:"cố vấn học tập", scenario:"Bạn đang tư vấn chọn ngành học.", opener:"Hello! Let's talk about your study plans. What subjects are you most interested in?" },
  { id:"r12", level:3, icon:"📰", role:"phóng viên phỏng vấn", scenario:"Bạn đang được phỏng vấn về một chủ đề xã hội.", opener:"Thanks for joining us today. What's your opinion on the growing use of technology in daily life?" },

  // ===== LEVEL 4 — B2 =====
  { id:"r13", level:4, icon:"💼", role:"nhà tuyển dụng", scenario:"Bạn đang tham gia một buổi phỏng vấn xin việc.", opener:"Thank you for coming in today. Can you tell me about a challenge you faced at work and how you handled it?" },
  { id:"r14", level:4, icon:"🤝", role:"đối tác đàm phán kinh doanh", scenario:"Bạn đang đàm phán hợp đồng với một đối tác.", opener:"Let's discuss the terms of this agreement. What are your main concerns about the proposal?" },
  { id:"r15", level:4, icon:"🗣️", role:"người tranh luận", scenario:"Bạn đang tranh luận về một vấn đề xã hội gây tranh cãi.", opener:"I'd like to hear your perspective: do you think social media does more harm than good?" },
  { id:"r16", level:4, icon:"🌍", role:"nhà nghiên cứu môi trường", scenario:"Bạn đang thảo luận về vấn đề môi trường.", opener:"Climate change is a pressing issue. What do you think individuals can realistically do to help?" },
];

// ============ HỒ SƠ & HUY HIỆU ============
const AVATAR_OPTIONS = ["🦊","🐱","🐼","🐻","🐯","🦁","🐸","🐵","🦉","🐰","🐨","🦄"];

// Mỗi badge có 1 điều kiện kiểm tra dựa trên profile state.
// type: "streak" | "points" | "vocabLearned" | "grammarDone" | "listenDone" | "speakDone" | "totalActivities"
const BADGE_DATA = [
  { id:"b1", icon:"🔥", name:"Khởi động", desc:"Học liên tiếp 3 ngày", type:"streak", goal:3 },
  { id:"b2", icon:"🔥", name:"Kiên trì", desc:"Học liên tiếp 7 ngày", type:"streak", goal:7 },
  { id:"b3", icon:"🔥", name:"Bền bỉ", desc:"Học liên tiếp 30 ngày", type:"streak", goal:30 },
  { id:"b4", icon:"⭐", name:"Người mới", desc:"Đạt 100 điểm", type:"points", goal:100 },
  { id:"b5", icon:"🌟", name:"Chăm chỉ", desc:"Đạt 500 điểm", type:"points", goal:500 },
  { id:"b6", icon:"💫", name:"Xuất sắc", desc:"Đạt 1500 điểm", type:"points", goal:1500 },
  { id:"b7", icon:"🏆", name:"Cao thủ", desc:"Đạt 3000 điểm", type:"points", goal:3000 },
  { id:"b8", icon:"📖", name:"Mọt từ vựng", desc:"Học thuộc 40 từ", type:"vocabLearned", goal:40 },
  { id:"b9", icon:"📚", name:"Bậc thầy từ vựng", desc:"Học thuộc toàn bộ từ vựng (160 từ)", type:"vocabLearned", goal:160 },
  { id:"b10", icon:"📘", name:"Vua ngữ pháp", desc:"Hoàn thành toàn bộ câu ngữ pháp", type:"grammarDone", goal:60 },
  { id:"b11", icon:"🎧", name:"Tai thính", desc:"Hoàn thành toàn bộ bài nghe", type:"listenDone", goal:40 },
  { id:"b12", icon:"🎙️", name:"Phát âm chuẩn", desc:"Hoàn thành toàn bộ bài nói", type:"speakDone", goal:40 },
];

// Các mốc mục tiêu chung của nhóm — tính theo tổng điểm của TẤT CẢ hồ sơ trên máy
const GROUP_GOALS = [
  { id:"gg1", icon:"🥉", name:"Mốc Đồng", goal:500, reward:"Cả nhóm cùng mở khóa hình nền chủ đề 'Buổi sáng năng lượng'." },
  { id:"gg2", icon:"🥈", name:"Mốc Bạc", goal:2000, reward:"Cả nhóm nhận danh hiệu 'Đội hình kỷ luật'." },
  { id:"gg3", icon:"🥇", name:"Mốc Vàng", goal:5000, reward:"Cả nhóm nhận danh hiệu 'Bậc thầy tiếng Anh' + lời chúc đặc biệt." },
  { id:"gg4", icon:"💎", name:"Mốc Kim Cương", goal:10000, reward:"Cả nhóm đạt danh hiệu 'Chinh phục B2' — cùng nhau ăn mừng thành tích!" },
];

// ============ LEVEL: NỘI DUNG MỞ KHOÁ DẦN (chuẩn CEFR) ============
// % hoàn thành tối thiểu của level hiện tại để mở khoá level tiếp theo
const LEVEL_UNLOCK_PERCENT = 80;

const LEVEL_DATA = [
  { level:1, name:"A1 — Khởi đầu", desc:"Gia đình, ăn uống, số đếm, màu sắc — từ vựng và ngữ pháp cơ bản nhất." },
  { level:2, name:"A2 — Cơ bản", desc:"Công việc, du lịch, cảm xúc, mua sắm — giao tiếp đời thường." },
  { level:3, name:"B1 — Trung cấp", desc:"Môi trường, công nghệ, quan hệ xã hội — diễn đạt ý kiến, kể chuyện." },
  { level:4, name:"B2 — Trung cao cấp", desc:"Kinh tế, tranh luận, học thuật, idioms — giao tiếp tự tin, lập luận chặt chẽ." },
];

// ============ BẢNG PHIÊN ÂM IPA (tiếng Anh) ============
// group: "Phụ âm" | "Nguyên âm đơn" | "Nguyên âm đôi"
// tip: gợi ý cách phát âm gần đúng bằng tiếng Việt (chỉ mang tính tham khảo,
// không hoàn toàn chính xác vì 2 ngôn ngữ có hệ âm vị khác nhau)
const IPA_DATA = [
  // Phụ âm
  { ipa:"/p/", group:"Phụ âm", example:"pen", tip:"như \"p\" tiếng Việt, bật hơi nhẹ", note:"" },
  { ipa:"/b/", group:"Phụ âm", example:"book", tip:"như \"b\" tiếng Việt", note:"" },
  { ipa:"/t/", group:"Phụ âm", example:"tea", tip:"như \"t\" tiếng Việt, bật hơi", note:"" },
  { ipa:"/d/", group:"Phụ âm", example:"dog", tip:"như \"đ\" tiếng Việt", note:"" },
  { ipa:"/k/", group:"Phụ âm", example:"cat", tip:"như \"c/k\" tiếng Việt", note:"" },
  { ipa:"/g/", group:"Phụ âm", example:"go", tip:"như \"g\" tiếng Việt", note:"" },
  { ipa:"/f/", group:"Phụ âm", example:"fish", tip:"như \"ph\" tiếng Việt, cắn nhẹ môi dưới", note:"" },
  { ipa:"/v/", group:"Phụ âm", example:"very", tip:"răng trên chạm môi dưới, rung nhẹ — khác /w/", note:"Người Việt dễ nhầm /v/ với /w/" },
  { ipa:"/θ/", group:"Phụ âm", example:"think", tip:"đặt lưỡi giữa 2 hàm răng, thổi hơi — không có âm tương đương trong tiếng Việt", note:"Hay bị đọc nhầm thành /s/ hoặc /t/" },
  { ipa:"/ð/", group:"Phụ âm", example:"this", tip:"giống /θ/ nhưng có rung dây thanh — không có âm tương đương", note:"Hay bị đọc nhầm thành /d/ hoặc /z/" },
  { ipa:"/s/", group:"Phụ âm", example:"see", tip:"như \"s\" tiếng Việt (xát nhẹ)", note:"" },
  { ipa:"/z/", group:"Phụ âm", example:"zoo", tip:"như /s/ nhưng có rung dây thanh", note:"" },
  { ipa:"/ʃ/", group:"Phụ âm", example:"she", tip:"như \"s\" trong tiếng Việt (\"sờ\" miền Bắc đọc nhẹ)", note:"" },
  { ipa:"/ʒ/", group:"Phụ âm", example:"vision", tip:"như /ʃ/ nhưng có rung dây thanh, hơi giống \"d\" nhẹ", note:"" },
  { ipa:"/h/", group:"Phụ âm", example:"hat", tip:"như \"h\" tiếng Việt", note:"" },
  { ipa:"/m/", group:"Phụ âm", example:"man", tip:"như \"m\" tiếng Việt", note:"" },
  { ipa:"/n/", group:"Phụ âm", example:"no", tip:"như \"n\" tiếng Việt", note:"" },
  { ipa:"/ŋ/", group:"Phụ âm", example:"sing", tip:"như \"ng\" cuối tiếng Việt (vd \"sang\")", note:"" },
  { ipa:"/l/", group:"Phụ âm", example:"leg", tip:"như \"l\" tiếng Việt, đầu lưỡi chạm răng trên", note:"" },
  { ipa:"/r/", group:"Phụ âm", example:"red", tip:"cuộn lưỡi nhẹ, không chạm vào đâu — khác /l/", note:"Người Việt dễ nhầm /r/ với /l/" },
  { ipa:"/j/", group:"Phụ âm", example:"yes", tip:"như \"d/gi\" đầu trong \"da/dùa\" miền Nam, hoặc như \"y\" trong \"yêu\"", note:"" },
  { ipa:"/w/", group:"Phụ âm", example:"we", tip:"như \"w\" trong \"oa\", tròn môi — khác /v/", note:"Người Việt dễ nhầm /w/ với /v/" },
  { ipa:"/tʃ/", group:"Phụ âm", example:"chair", tip:"như \"ch\" tiếng Việt", note:"" },
  { ipa:"/dʒ/", group:"Phụ âm", example:"job", tip:"như \"j\" tiếng Anh, gần giống \"d/gi\" bật hơi", note:"" },
  // Nguyên âm đơn
  { ipa:"/iː/", group:"Nguyên âm đơn", example:"see", tip:"như \"i\" dài, kéo dài hơn tiếng Việt", note:"" },
  { ipa:"/ɪ/", group:"Nguyên âm đơn", example:"sit", tip:"như \"i\" ngắn, gần giống \"i\" trong \"sit\"", note:"" },
  { ipa:"/uː/", group:"Nguyên âm đơn", example:"food", tip:"như \"u\" dài, tròn môi", note:"" },
  { ipa:"/ʊ/", group:"Nguyên âm đơn", example:"book", tip:"như \"u\" ngắn", note:"" },
  { ipa:"/e/", group:"Nguyên âm đơn", example:"bed", tip:"như \"e\" tiếng Việt", note:"" },
  { ipa:"/ə/", group:"Nguyên âm đơn", example:"about", tip:"âm \"ơ\" rất nhẹ, không nhấn — phổ biến nhất trong tiếng Anh", note:"" },
  { ipa:"/ɜːr/", group:"Nguyên âm đơn", example:"bird", tip:"âm \"ơ\" kéo dài kèm /r/ (giọng Mỹ)", note:"" },
  { ipa:"/ɔː/", group:"Nguyên âm đơn", example:"law", tip:"như \"o\" dài, tròn môi", note:"" },
  { ipa:"/æ/", group:"Nguyên âm đơn", example:"cat", tip:"giữa \"a\" và \"e\", miệng mở rộng", note:"" },
  { ipa:"/ʌ/", group:"Nguyên âm đơn", example:"cup", tip:"như \"ă\" tiếng Việt nhưng ngắn gọn", note:"" },
  { ipa:"/ɑː/", group:"Nguyên âm đơn", example:"car", tip:"như \"a\" dài, miệng mở to", note:"" },
  // Nguyên âm đôi
  { ipa:"/eɪ/", group:"Nguyên âm đôi", example:"day", tip:"như \"ây\" tiếng Việt", note:"" },
  { ipa:"/aɪ/", group:"Nguyên âm đôi", example:"my", tip:"như \"ai\" tiếng Việt", note:"" },
  { ipa:"/ɔɪ/", group:"Nguyên âm đôi", example:"boy", tip:"như \"oi\" tiếng Việt", note:"" },
  { ipa:"/aʊ/", group:"Nguyên âm đôi", example:"now", tip:"như \"ao\" tiếng Việt", note:"" },
  { ipa:"/oʊ/", group:"Nguyên âm đôi", example:"go", tip:"như \"âu/ô-u\" tiếng Việt (giọng Mỹ)", note:"" },
  { ipa:"/ɪər/", group:"Nguyên âm đôi", example:"year", tip:"như \"i-ơ\" kèm /r/", note:"" },
  { ipa:"/eər/", group:"Nguyên âm đôi", example:"hair", tip:"như \"e-ơ\" kèm /r/", note:"" },
  { ipa:"/ʊər/", group:"Nguyên âm đôi", example:"tour", tip:"như \"u-ơ\" kèm /r/", note:"" },
];
