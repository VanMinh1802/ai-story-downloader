// Bài Tập 2: Async & Array Manipulation
// Chạy bằng lệnh: deno run learning/exercises/02_async_data.ts

// 1. Giả lập một hàm gọi API tốn thời gian (delay)
const fakeApiCall = (id: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const time = Math.random() * 1000 + 500; // Tốn 0.5 - 1.5 giây
        setTimeout(() => {
            // Giả lập thỉnh thoảng bị lỗi (20% cơ hội lỗi)
            if (Math.random() < 0.2) {
                reject(new Error(`Lỗi kết nối chương ${id}`));
            } else {
                resolve(`Nội dung chương ${id} [quảng cáo] ... Lorem ipsum...`);
            }
        }, time);
    });
};

// 2. Bài tập của bạn
async function processChapters() {
    console.log("🚀 Bắt đầu tải 5 chương truyện...");
    
    const chapterIds = [1, 2, 3, 4, 5];

    // su dung map de tao ra mang cac Promise goi ham fakeApiCall
    const promises = chapterIds.map(id => fakeApiCall(id));

    //su dung Promise.allSettled de cho het cac Promise xong
    const results = await Promise.allSettled(promises);

    //duyet qua mang results va xu ly
    const finalContent: string[] = [];
    results.forEach((res, index) => {
        if(res.status == 'fulfilled'){
            // xu li chuoi: xoa "[quảng cáo]"
            const cleanText = res.value.replace("[quảng cáo]", "").trim();
            // in ra 20 ky tu dau tien
            console.log(`Chuong ${index + 1}: ${cleanText.substring(0, 20)}...`);
            //Thêm vào mảng
            finalContent.push(cleanText);
        }else{
            console.log(`Chuong ${index + 1}: that bai`);
        }
    });
    console.log(`\n Tonron kết: Tải thành công ${finalContent.length}/5 chương.`);

}


// Chạy hàm chính
processChapters();

// ---------------------------------------------------------
// LỜI GIẢI MẪU (Bỏ comment để chạy thử nếu bí)
// ---------------------------------------------------------

// async function solution() {
//     console.log("🚀 [Solution] Bắt đầu tải 5 chương truyện...");
//     const chapterIds = [1, 2, 3, 4, 5];

//     const promises = chapterIds.map(id => fakeApiCall(id));
    
//     const results = await Promise.allSettled(promises);

//     const finalContent: string[] = [];

//     results.forEach((res, index) => {
//         if (res.status === 'fulfilled') {
//             // Xử lý chuỗi: Xóa "[quảng cáo]"
//             const cleanText = res.value.replace("[quảng cáo]", "").trim();
//             // In ra 20 ký tự đầu tiên
//             console.log(`✅ Chương ${index + 1}: ${cleanText.substring(0, 20)}...`);
//             // Thêm vào mảng
//             finalContent.push(cleanText);
//         } else {
//             // In ra thông báo lỗi
//             console.log(`❌ Chương ${index + 1} thất bại.`);
//         }
//     });
//     // In ra tổng kết
//     console.log(`\n🎉 Tổng kết: Tải thành công ${finalContent.length}/5 chương.`);
// }
// // Chạy hàm chính
// solution();
