// import { useState } from "react";

// export default function SecretRoom({ question, answer, handleAnswer }) {
//     return (<div className="flex flex-col justify-center items-center pt-10 bg-sky-500 w-[90%]">
//         <h1>SecretRoom</h1>
//         <p>Message from outside :
//             <span>{question ? question : "Waiting for a message..."}</span>
//         </p>
//         <textarea
//             value={answer}
//             onChange={handleAnswer}
//             className="bg-white text-black rounded px-2 py-1"
//             placeholder="Type your message here..." />
//         <p className="text-amber-950 text-2xl font-bold pb-10">
//             Reply to the outside:
//             <span className="text-yellow-500">{answer ? answer : "Waiting for a reply..."}</span>
//         </p>
//     </div>
//     );
// }

export default function SecretRoom({ question, answer, setAnswer }) {
    return (
        <div className={`p-5 rounded-2xl shadow-inner border-t-8 transition-all duration-500 ${answer.includes("ช่วย") ? "border-red-500 bg-red-50" : "border-yellow-400 bg-white"}`}>
            <h4 className="font-bold flex items-center gap-2 text-lg text-slate-800">
                {answer.includes("ช่วย") ? "🚨 EMERGENCY" : "🤫 09 Secret Room"}
            </h4>

            <div className="my-4 p-3 bg-slate-100 rounded-lg border-l-4 border-blue-500">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Master's Voice:</p>
                <p className="text-sm font-semibold text-blue-600">{question || "Waiting for signal..."}</p>
            </div>

            <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border-2 border-slate-200 p-2 text-sm rounded-xl focus:ring-4 focus:ring-blue-400 outline-none transition-all"
                placeholder="Type: เข้ามาช่วยหน่อย"
            />
        </div>
    );
}