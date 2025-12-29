"use client";
import { useState, useEffect } from "react";

export default function LearningPlayground() {
  // 1. State cơ bản: Counter
  const [count, setCount] = useState(0);

  // 2. State input: Mirror text
  const [text, setText] = useState("");

  // 3. Effect: Clock
  const [seconds, setSeconds] = useState(0);

  // useEffect này chạy 1 lần duy nhất khi trang vừa load (do mảng [] rỗng)
  useEffect(() => {
    console.log("Component đã được mount (hiển thị)!");
    
    // Tạo bộ đếm thời gian
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // Dọn dẹp bộ nhớ khi người dùng rời đi
    return () => {
        console.log("Component đã unmount (biến mất)!");
        clearInterval(timer); 
    };
  }, []); // [] quan trọng: chỉ chạy 1 lần

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans text-gray-900">
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-center text-blue-600">🎡 Sân Chơi React (Playground)</h1>
            <p className="text-center text-gray-600">Nơi bạn thử nghiệm code mà không sợ làm hỏng dự án chính.</p>

            {/* Bài 1: Sự kiện Click */}
            <section className="border bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Counter (Đếm số)</h2>
                <p className="mb-4">Bạn đã bấm: <span className="font-bold text-blue-600 text-3xl mx-2">{count}</span> lần</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => setCount(count + 1)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors active:scale-95"
                    >
                        Tăng (+1)
                    </button>
                    <button
                        onClick={() => setCount(count - 1)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors active:scale-95"
                    >
                        Giảm (-1)
                    </button>
                    <button
                        onClick={() => setCount(0)}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                       Về 0
                    </button>
                </div>
            </section>

            {/* Bài 2: Input hai chiều */}
            <section className="border bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Magic Mirror (Gương thần)</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nhập gì đó vào đây:</label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Gõ tên bạn, câu thần chú, v.v..."
                            className="border p-3 w-full rounded focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded border border-purple-100">
                        <p className="text-xs text-purple-600 uppercase font-bold mb-1">Kết quả hiển thị tức thì:</p>
                        <p className="text-2xl font-mono text-purple-800 break-words min-h-[32px]">
                            {text ? text : <span className="text-gray-400 italic">...chưa có gì...</span>}
                        </p>
                    </div>
                </div>
            </section>

            {/* Bài 3: Effect */}
            <section className="border bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">3. Đồng hồ đếm giờ (useEffect)</h2>
                <div className="flex items-center gap-4">
                    <div className="text-4xl">⏱️</div>
                    <div>
                        <p>Bạn đã ở đây được:</p>
                        <p><span className="font-bold text-red-500 text-3xl">{seconds}</span> giây</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 bg-gray-100 p-2 rounded">
                    Code đếm giờ này chạy ngầm nhờ <code>useEffect</code>. Ngay cả khi bạn đang gõ phím ở bài 2, đồng hồ vẫn chạy độc lập!
                </p>
            </section>
            
            <div className="text-center pt-6">
                <a href="/" className="inline-block bg-white border border-gray-300 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors font-medium">
                    ← Quay về trang chủ (Ứng dụng chính)
                </a>
            </div>
        </div>
    </div>
  );
}
