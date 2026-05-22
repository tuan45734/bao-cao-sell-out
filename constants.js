// Dữ liệu NPP từ file Excel
const nppData = [
    { "ten": "NPP Công Giang", "doanhSo": 1000000000, "kv": "KV1" },
    { "ten": "NPP Cường Thịnh", "doanhSo": 720000000, "kv": "KV1" },
    { "ten": "NPP Dũng Cúc", "doanhSo": 400000000, "kv": "KV1" },
    { "ten": "NPP Đức Nam Tiến", "doanhSo": 900000000, "kv": "KV1" },
    { "ten": "NPP Long Liên", "doanhSo": 1050000000, "kv": "KV1" },
    { "ten": "NPP Bảo Lâm", "doanhSo": 1669801000, "kv": "KV1" },
    { "ten": "NPP Lâm Hạ", "doanhSo": 720000000, "kv": "KV1" },
    { "ten": "NPP Nguyên Vũ", "doanhSo": 1635000000, "kv": "KV1" },
    { "ten": "NPP Vũ Tấm", "doanhSo": 1250000000, "kv": "KV1" },
    { "ten": "NPP Thảo Nam", "doanhSo": 1050000000, "kv": "KV1" },
    { "ten": "NPP Tuấn Huê", "doanhSo": 1180000000, "kv": "KV1" },
    { "ten": "NPP Tuấn Yến", "doanhSo": 1070000000, "kv": "KV1" },
    { "ten": "NPP Duy Anh", "doanhSo": 806236000, "kv": "KV2" },
    { "ten": "NPP Hoa Việt", "doanhSo": 1306094000, "kv": "KV3" },
    { "ten": "NPP Hùng Huệ", "doanhSo": 806236000, "kv": "KV2" },
    { "ten": "NPP Long Châm", "doanhSo": 806236000, "kv": "KV2" },
    { "ten": "NPP Ngọc Kiên", "doanhSo": 1259604000, "kv": "KV2" },
    { "ten": "NPP Ngọc Thêu", "doanhSo": 1259604000, "kv": "KV2" },
    { "ten": "NPP Thành Lụa", "doanhSo": 740000000, "kv": "KV2" },
    { "ten": "NPP Phong Hiền", "doanhSo": 962447000, "kv": "KV2" },
    { "ten": "NPP Phúc Thịnh", "doanhSo": 810042000, "kv": "KV3" },
    { "ten": "NPP Phương Đông", "doanhSo": 3030456000, "kv": "KV2" },
    { "ten": "NPP Tuấn Huyền", "doanhSo": 806237000, "kv": "KV2" },
    { "ten": "NPP Bảo Cường", "doanhSo": 1275000000, "kv": "KV3" },
    { "ten": "NPP Hikoji", "doanhSo": 1465000000, "kv": "KV3" },
    { "ten": "NPP Long Hải", "doanhSo": 965000000, "kv": "KV3" },
    { "ten": "NPP Tân Hoa", "doanhSo": 1308000000, "kv": "KV3" },
    { "ten": "NPP Tây Đô", "doanhSo": 1360000000, "kv": "KV3" },
    { "ten": "NPP Thành Hân", "doanhSo": 1760000000, "kv": "KV3" },
    { "ten": "NPP Thắng Lợi", "doanhSo": 1309000000, "kv": "KV3" },
    { "ten": "NPP Tiến Thịnh", "doanhSo": 1260000000, "kv": "KV3" },
    { "ten": "NPP Ánh Thu", "doanhSo": 1399882300, "kv": "KV4" },
    { "ten": "NPP Dũng Béo", "doanhSo": 1166568583, "kv": "KV4" },
    { "ten": "NPP Thăng Hương", "doanhSo": 933254867, "kv": "KV4" },
    { "ten": "NPP Dương Minh", "doanhSo": 1399882300, "kv": "KV4" },
    { "ten": "NPP Đức Oanh", "doanhSo": 933254867, "kv": "KV4" },
    { "ten": "NPP Hưng Thịnh", "doanhSo": 1166568583, "kv": "KV4" },
    { "ten": "NPP Ngọc Phúc", "doanhSo": 933254867, "kv": "KV4" },
    { "ten": "NPP Nguyễn Đình Hân", "doanhSo": 1399882300, "kv": "KV4" },
    { "ten": "NPP Tân Thúy", "doanhSo": 2333137167, "kv": "KV4" },
    { "ten": "NPP Thảo Thắng", "doanhSo": 1399882300, "kv": "KV4" },
    { "ten": "NPP Tùng Phương", "doanhSo": 933254867, "kv": "KV3" },
    { "ten": "NPP Đồng Lợi", "doanhSo": 842336138, "kv": "KV5" },
    { "ten": "NPP Hải Hằng", "doanhSo": 1203337340, "kv": "KV5" },
    { "ten": "NPP Hoàng Minh", "doanhSo": 1484940907, "kv": "KV5" },
    { "ten": "NPP Oanh Định", "doanhSo": 682100632, "kv": "KV5" },
    { "ten": "NPP Sơn Lâm", "doanhSo": 1431184296, "kv": "KV5" },
    { "ten": "NPP Thái Hoà", "doanhSo": 1510581931, "kv": "KV5" },
    { "ten": "NPP Thảo Xuân", "doanhSo": 1083003606, "kv": "KV5" },
    { "ten": "NPP Duy Khoa", "doanhSo": 1323671074, "kv": "KV5" },
    { "ten": "NPP Hiền Cường", "doanhSo": 907878933, "kv": "KV5" },
    { "ten": "NPP Tuấn Vân", "doanhSo": 842336138, "kv": "KV5" },
    { "ten": "NPP Vũ Đức Nam", "doanhSo": 722002404, "kv": "KV5" },
    { "ten": "NPP Anh Minh HT", "doanhSo": 1200000000, "kv": "KV6" },
    { "ten": "NPP Hà Thanh", "doanhSo": 1150000000, "kv": "KV6" },
    { "ten": "NPP Hồng Đức", "doanhSo": 740000000, "kv": "KV6" },
    { "ten": "NPP Thanh Bình", "doanhSo": 708000000, "kv": "KV6" },
    { "ten": "NPP Linh Trang", "doanhSo": 760000000, "kv": "KV6" },
    { "ten": "NPP Mạnh Hà 1", "doanhSo": 1150000000, "kv": "KV6" },
    { "ten": "NPP Minh Châu", "doanhSo": 920000000, "kv": "KV6" },
    { "ten": "NPP Nhung Tùng", "doanhSo": 1380000000, "kv": "KV6" },
    { "ten": "NPP Phương Hà", "doanhSo": 1140000000, "kv": "KV6" },
    { "ten": "NPP Mạnh Hà 2", "doanhSo": 630000000, "kv": "KV6" },
    { "ten": "NPP Tân Bích An", "doanhSo": 570000000, "kv": "KV6" },
    { "ten": "NPP Thành Thanh", "doanhSo": 1150000000, "kv": "KV6" },
    { "ten": "NPP Trường Hằng", "doanhSo": 800000000, "kv": "KV6" },
    { "ten": "NPP Minh Lộc", "doanhSo": 352000000, "kv": "KV6" },
    { "ten": "NPP Thông Thơm", "doanhSo": 380000000, "kv": "KV6" },
    {   "ten": "NPP Tâm Bảo Hân",   "doanhSo": 800000000,   "kv": "KV7" },
 {   "ten": "NPP NAKOA",   "doanhSo": 640000000,   "kv": "KV7" },
 {   "ten": "NPP Dương Thiên Nhi",   "doanhSo": 640000000,   "kv": "KV7" },
 {   "ten": "NPP Tường Vy",   "doanhSo": 640000000,   "kv": "KV7" },
 {   "ten": "NPP Minh Huy",   "doanhSo": 677600000,   "kv": "KV7" },
 {   "ten": "NPP Hiền Thuận",   "doanhSo": 870000000,   "kv": "KV7" },
 {   "ten": "NPP Thúy Diễm",   "doanhSo": 640000000,   "kv": "KV7" },
 {   "ten": "NPP Anh Viên",   "doanhSo": 668000000,   "kv": "KV7" },
 {   "ten": "NPP Hoàng Gia Bảo",   "doanhSo": 668000000,   "kv": "KV7" },
 {   "ten": "NPP Trung Nam",   "doanhSo": 668000000,   "kv": "KV7" },
 {   "ten": "NPP Nam Khánh",   "doanhSo": 0,   "kv": "KV7" },
 {   "ten": "NPP Thanh Trà",   "doanhSo": 0,   "kv": "KV7" }
];

const additionalKPIData = [];

// Biến toàn cục
let currentData = null;
let topCompletionChart = null;
let bottomCompletionChart = null;
let topAreaChart = null;
let bottomAreaChart = null;
let areaRevenueChart = null;
let allData = null;
let employeeMap = new Map();
let groupMap = new Map();
let hasDataLabelsPlugin = false;
let currentTopKVFilter = 'all';
let currentBottomKVFilter = 'all';
let currentKVFilter = 'all';