// ============ DỮ LIỆU MẪU (A1-A2) ============
// Bạn có thể tự thêm/sửa từ vựng, câu ngữ pháp, đoạn nghe, câu nói ở đây.

const VOCAB_DATA = [
  // ===== LEVEL 1 =====
  // Chủ đề: Gia đình
  { id:"v1", level:1, topic:"Gia đình", word:"family", phon:"/ˈfæməli/", meaning:"gia đình", example:"My family is small." },
  { id:"v2", level:1, topic:"Gia đình", word:"mother", phon:"/ˈmʌðər/", meaning:"mẹ", example:"My mother cooks every day." },
  { id:"v3", level:1, topic:"Gia đình", word:"father", phon:"/ˈfɑːðər/", meaning:"cha", example:"My father works in a bank." },
  { id:"v4", level:1, topic:"Gia đình", word:"sister", phon:"/ˈsɪstər/", meaning:"em/chị gái", example:"I have one sister." },
  { id:"v5", level:1, topic:"Gia đình", word:"brother", phon:"/ˈbrʌðər/", meaning:"anh/em trai", example:"My brother is tall." },
  { id:"v6", level:1, topic:"Gia đình", word:"parents", phon:"/ˈperənts/", meaning:"cha mẹ", example:"My parents live in Hanoi." },
  // Chủ đề: Ăn uống
  { id:"v7", level:1, topic:"Ăn uống", word:"rice", phon:"/raɪs/", meaning:"cơm/gạo", example:"I eat rice every day." },
  { id:"v8", level:1, topic:"Ăn uống", word:"water", phon:"/ˈwɔːtər/", meaning:"nước", example:"I drink water in the morning." },
  { id:"v9", level:1, topic:"Ăn uống", word:"breakfast", phon:"/ˈbrekfəst/", meaning:"bữa sáng", example:"I have breakfast at 7 AM." },
  { id:"v10", level:1, topic:"Ăn uống", word:"hungry", phon:"/ˈhʌŋɡri/", meaning:"đói bụng", example:"I am hungry now." },
  { id:"v11", level:1, topic:"Ăn uống", word:"delicious", phon:"/dɪˈlɪʃəs/", meaning:"ngon", example:"This soup is delicious." },
  { id:"v12", level:1, topic:"Ăn uống", word:"vegetable", phon:"/ˈvedʒtəbəl/", meaning:"rau", example:"I like vegetables." },
  // ===== LEVEL 2 =====
  // Chủ đề: Công việc
  { id:"v13", level:2, topic:"Công việc", word:"job", phon:"/dʒɑːb/", meaning:"công việc", example:"She has a good job." },
  { id:"v14", level:2, topic:"Công việc", word:"office", phon:"/ˈɔːfɪs/", meaning:"văn phòng", example:"I work in an office." },
  { id:"v15", level:2, topic:"Công việc", word:"meeting", phon:"/ˈmiːtɪŋ/", meaning:"cuộc họp", example:"We have a meeting at 9 AM." },
  { id:"v16", level:2, topic:"Công việc", word:"busy", phon:"/ˈbɪzi/", meaning:"bận rộn", example:"I am busy today." },
  { id:"v17", level:2, topic:"Công việc", word:"salary", phon:"/ˈsæləri/", meaning:"lương", example:"My salary is good." },
  { id:"v18", level:2, topic:"Công việc", word:"colleague", phon:"/ˈkɑːliːɡ/", meaning:"đồng nghiệp", example:"My colleague is friendly." },
  // Chủ đề: Du lịch
  { id:"v19", level:2, topic:"Du lịch", word:"travel", phon:"/ˈtrævəl/", meaning:"du lịch/đi lại", example:"I love to travel." },
  { id:"v20", level:2, topic:"Du lịch", word:"airport", phon:"/ˈerpɔːrt/", meaning:"sân bay", example:"The airport is far from here." },
  { id:"v21", level:2, topic:"Du lịch", word:"ticket", phon:"/ˈtɪkɪt/", meaning:"vé", example:"I bought a ticket online." },
  { id:"v22", level:2, topic:"Du lịch", word:"hotel", phon:"/hoʊˈtel/", meaning:"khách sạn", example:"We stayed in a nice hotel." },
  { id:"v23", level:2, topic:"Du lịch", word:"luggage", phon:"/ˈlʌɡɪdʒ/", meaning:"hành lý", example:"My luggage is heavy." },
  { id:"v24", level:2, topic:"Du lịch", word:"passport", phon:"/ˈpæspɔːrt/", meaning:"hộ chiếu", example:"Don't forget your passport." },
  // Chủ đề: Cảm xúc
  { id:"v25", level:2, topic:"Cảm xúc", word:"happy", phon:"/ˈhæpi/", meaning:"vui vẻ", example:"I am happy today." },
  { id:"v26", level:2, topic:"Cảm xúc", word:"tired", phon:"/ˈtaɪərd/", meaning:"mệt mỏi", example:"I am tired after work." },
  { id:"v27", level:2, topic:"Cảm xúc", word:"excited", phon:"/ɪkˈsaɪtɪd/", meaning:"phấn khích", example:"I am excited about the trip." },
  { id:"v28", level:2, topic:"Cảm xúc", word:"worried", phon:"/ˈwʌrid/", meaning:"lo lắng", example:"She is worried about the test." },
  { id:"v29", level:2, topic:"Cảm xúc", word:"angry", phon:"/ˈæŋɡri/", meaning:"tức giận", example:"He is angry at me." },
  { id:"v30", level:2, topic:"Cảm xúc", word:"calm", phon:"/kɑːm/", meaning:"bình tĩnh", example:"Please stay calm." },
  // ===== LEVEL 3 =====
  // Chủ đề: Thời gian
  { id:"v31", level:3, topic:"Thời gian", word:"today", phon:"/təˈdeɪ/", meaning:"hôm nay", example:"Today is Monday." },
  { id:"v32", level:3, topic:"Thời gian", word:"tomorrow", phon:"/təˈmɑːroʊ/", meaning:"ngày mai", example:"See you tomorrow." },
  { id:"v33", level:3, topic:"Thời gian", word:"yesterday", phon:"/ˈjestərdeɪ/", meaning:"hôm qua", example:"I was busy yesterday." },
  { id:"v34", level:3, topic:"Thời gian", word:"early", phon:"/ˈɜːrli/", meaning:"sớm", example:"I wake up early." },
  { id:"v35", level:3, topic:"Thời gian", word:"late", phon:"/leɪt/", meaning:"trễ/muộn", example:"Don't be late." },
  { id:"v36", level:3, topic:"Thời gian", word:"often", phon:"/ˈɔːfən/", meaning:"thường xuyên", example:"I often read books." },
  // Chủ đề: Mua sắm
  { id:"v37", level:3, topic:"Mua sắm", word:"price", phon:"/praɪs/", meaning:"giá cả", example:"What is the price?" },
  { id:"v38", level:3, topic:"Mua sắm", word:"cheap", phon:"/tʃiːp/", meaning:"rẻ", example:"This shirt is cheap." },
  { id:"v39", level:3, topic:"Mua sắm", word:"expensive", phon:"/ɪkˈspensɪv/", meaning:"đắt", example:"That bag is expensive." },
  { id:"v40", level:3, topic:"Mua sắm", word:"discount", phon:"/ˈdɪskaʊnt/", meaning:"giảm giá", example:"There is a big discount." },
  { id:"v41", level:3, topic:"Mua sắm", word:"market", phon:"/ˈmɑːrkɪt/", meaning:"chợ/thị trường", example:"I go to the market every day." },
  { id:"v42", level:3, topic:"Mua sắm", word:"customer", phon:"/ˈkʌstəmər/", meaning:"khách hàng", example:"The customer is happy." },
];

const GRAMMAR_DATA = [
  { id:"g1", level:1, question:"I ___ a student.", options:["am","is","are","be"], answer:0, note:"Chủ ngữ 'I' đi với 'am'." },
  { id:"g2", level:1, question:"She ___ to school every day.", options:["go","goes","going","went"], answer:1, note:"Ngôi thứ 3 số ít + thêm 's/es' ở thì hiện tại đơn." },
  { id:"g3", level:1, question:"They ___ watching TV now.", options:["is","am","are","be"], answer:2, note:"'They' là số nhiều, dùng 'are'." },
  { id:"g4", level:1, question:"___ you like coffee?", options:["Do","Does","Are","Is"], answer:0, note:"Câu hỏi Yes/No với 'you' dùng 'Do'." },
  { id:"g5", level:1, question:"He ___ at home yesterday.", options:["is","was","were","be"], answer:1, note:"Quá khứ đơn của 'is/am' là 'was'." },
  { id:"g6", level:2, question:"There ___ many books on the table.", options:["is","are","was","be"], answer:1, note:"Danh từ số nhiều 'books' dùng 'are'." },
  { id:"g7", level:2, question:"I ___ finished my homework yet.", options:["don't","didn't","haven't","isn't"], answer:2, note:"Thì hiện tại hoàn thành phủ định: haven't + V3." },
  { id:"g8", level:2, question:"Can you ___ me your pen?", options:["lend","lending","lent","lends"], answer:0, note:"Sau động từ khuyết thiếu 'can' dùng động từ nguyên thể." },
  { id:"g9", level:2, question:"My sister is ___ than me.", options:["tall","taller","tallest","more tall"], answer:1, note:"So sánh hơn với tính từ ngắn: thêm '-er'." },
  { id:"g10", level:2, question:"We ___ to the cinema last night.", options:["go","goes","went","going"], answer:2, note:"Quá khứ đơn của 'go' là 'went'." },
  { id:"g11", level:3, question:"She is interested ___ music.", options:["on","in","at","with"], answer:1, note:"Cụm từ cố định: be interested in." },
  { id:"g12", level:3, question:"I have ___ money than him.", options:["less","fewer","little","few"], answer:0, note:"'Money' là danh từ không đếm được, dùng 'less'." },
  { id:"g13", level:3, question:"If it rains, I ___ stay home.", options:["will","would","am","was"], answer:0, note:"Câu điều kiện loại 1: If + hiện tại, will + V." },
  { id:"g14", level:3, question:"This book is ___ than that one.", options:["interesting","more interesting","most interesting","interestinger"], answer:1, note:"So sánh hơn với tính từ dài: more + adj." },
  { id:"g15", level:3, question:"He ___ English for 3 years.", options:["studies","studied","has studied","study"], answer:2, note:"Hiện tại hoàn thành diễn tả hành động kéo dài đến hiện tại." },
];

const LISTEN_DATA = [
  { id:"l1", level:1, text:"Hello, my name is ___. I am from Vietnam.", answer:"Anna", full:"Hello, my name is Anna. I am from Vietnam." },
  { id:"l2", level:1, text:"I wake up at ___ every morning.", answer:"six", full:"I wake up at six every morning." },
  { id:"l3", level:1, text:"My favorite food is ___.", answer:"pizza", full:"My favorite food is pizza." },
  { id:"l4", level:2, text:"It is ___ today, so I will stay home.", answer:"raining", full:"It is raining today, so I will stay home." },
  { id:"l5", level:2, text:"She works as a ___ at the hospital.", answer:"nurse", full:"She works as a nurse at the hospital." },
  { id:"l6", level:2, text:"We are going to the ___ this weekend.", answer:"beach", full:"We are going to the beach this weekend." },
  { id:"l7", level:3, text:"Can you please close the ___?", answer:"window", full:"Can you please close the window?" },
  { id:"l8", level:3, text:"I need to buy some ___ from the store.", answer:"milk", full:"I need to buy some milk from the store." },
];

const SPEAK_DATA = [
  { id:"s1", level:1, text:"Good morning, how are you today?" },
  { id:"s2", level:1, text:"I would like a cup of coffee, please." },
  { id:"s3", level:1, text:"What time does the train leave?" },
  { id:"s4", level:2, text:"Could you tell me the way to the station?" },
  { id:"s5", level:2, text:"I have been working here for two years." },
  { id:"s6", level:2, text:"Nice to meet you. My name is Linh." },
  { id:"s7", level:3, text:"I am looking forward to seeing you soon." },
  { id:"s8", level:3, text:"This restaurant has very delicious food." },
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
  { id:"b7", icon:"📖", name:"Mọt từ vựng", desc:"Học thuộc 20 từ", type:"vocabLearned", goal:20 },
  { id:"b8", icon:"📚", name:"Bậc thầy từ vựng", desc:"Học thuộc toàn bộ từ vựng", type:"vocabLearned", goal:42 },
  { id:"b9", icon:"📘", name:"Vua ngữ pháp", desc:"Hoàn thành toàn bộ câu ngữ pháp", type:"grammarDone", goal:15 },
  { id:"b10", icon:"🎧", name:"Tai thính", desc:"Hoàn thành toàn bộ bài nghe", type:"listenDone", goal:8 },
  { id:"b11", icon:"🎙️", name:"Phát âm chuẩn", desc:"Hoàn thành toàn bộ bài nói", type:"speakDone", goal:8 },
];

// Các mốc mục tiêu chung của nhóm — tính theo tổng điểm của TẤT CẢ hồ sơ trên máy
const GROUP_GOALS = [
  { id:"gg1", icon:"🥉", name:"Mốc Đồng", goal:500, reward:"Cả nhóm cùng mở khóa hình nền chủ đề 'Buổi sáng năng lượng'." },
  { id:"gg2", icon:"🥈", name:"Mốc Bạc", goal:2000, reward:"Cả nhóm nhận danh hiệu 'Đội hình kỷ luật'." },
  { id:"gg3", icon:"🥇", name:"Mốc Vàng", goal:5000, reward:"Cả nhóm nhận danh hiệu 'Bậc thầy tiếng Anh' + lời chúc đặc biệt." },
];

// ============ LEVEL: NỘI DUNG MỞ KHOÁ DẦN ============
// % hoàn thành tối thiểu của level hiện tại để mở khoá level tiếp theo
const LEVEL_UNLOCK_PERCENT = 80;

const LEVEL_DATA = [
  { level:1, name:"Cấp 1: Khởi đầu", desc:"Gia đình, ăn uống — từ vựng và ngữ pháp cơ bản nhất." },
  { level:2, name:"Cấp 2: Mở rộng", desc:"Công việc, du lịch, cảm xúc — câu phức tạp hơn." },
  { level:3, name:"Cấp 3: Nâng cao", desc:"Thời gian, mua sắm — phản xạ giao tiếp đời thường." },
];
