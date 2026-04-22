// import Corridor from "./06_Corridor";
// export default function Hall({ question, answer, handleAnswer }) {
//     return (<div className="flex flex-col justify-center items-center pt-10 bg-amber-500 w-[90%]">
//         <h1>Hall</h1>
//         {question ? question : "Waiting for a message..."}
//         {/* Corridor*/}
//         <Corridor question={question} answer={answer} handleAnswer={handleAnswer}/>
//     </div>
//     );
// }

import Corridor from "./06_Corridor";

export default function Hall(props) {
    return (
        <div className="p-4 bg-amber-500 rounded-3xl shadow-lg">
            <h2 className="font-bold text-white mb-2">05 Hall</h2>
            <Corridor {...props} />
        </div>
    );
}