// import Room from "./04_Room";
// export default function Chamber({ question, answer, handleAnswer }) {
//     return (<div className="flex flex-col justify-center items-center pt-10 bg-purple-500 w-[90%]">
//         <h1>Chamber</h1>
//         {question ? question : "Waiting for a message..."}
//         {/* Room */}
//         <Room question={question} answer={answer} handleAnswer={handleAnswer}/>
//     </div>
//     );
// }

import Room from "./04_Room";

export default function Chamber(props) {
    return (
        <div className="p-4 bg-purple-500 rounded-3xl shadow-lg">
            <h2 className="font-bold text-white mb-2">03 Chamber</h2>
            <Room {...props} />
        </div>
    );
}