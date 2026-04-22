// import Tower from "./02_Tower";
// export default function Castle({ question, answer, handleAnswer }) {
//     return (<div className="flex flex-col justify-center items-center pt-10 bg-orange-500 w-[90%]">
//         <h1>Castle</h1>
//         {question ? question : "Waiting for a message..."}
//         {/* Tower */}
//         <Tower question={question} answer={answer} handleAnswer={handleAnswer} />
//     </div>
//     );
// }

import Tower from "./02_Tower";

export default function Castle(props) {
    return (
        <div className="p-4 bg-orange-500 rounded-3xl shadow-lg w-[95%] max-w-4xl">
            <h2 className="font-bold text-white mb-2">01 Castle</h2>
            <Tower {...props} />
        </div>
    );
}