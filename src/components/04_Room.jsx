// import Hall from "./05_Hall";
// export default function Room({ question, answer, handleAnswer }) {
//     return (<div className="flex flex-col justify-center items-center pt-10 bg-pink-500 w-[90%]">
//         <h1>Room</h1>
//         {question ? question : "Waiting for a message..."}
//         {/* Hall */}
//         <Hall question={question} answer={answer} handleAnswer={handleAnswer}/>
//     </div>
//     );
// }

import Hall from "./05_Hall";

export default function Room(props) {
    return (
        <div className="p-4 bg-pink-500 rounded-3xl shadow-lg">
            <h2 className="font-bold text-white mb-2">04 Room</h2>
            <Hall {...props} />
        </div>
    );
}