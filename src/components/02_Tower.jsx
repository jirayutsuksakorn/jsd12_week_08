// import Chamber from "./03_Chamber";
// export default function Tower({ question, answer, handleAnswer}) {
//     return (<div className="flex flex-col justify-center items-center pt-10 bg-red-500 w-[90%]">
//         <h1>Tower</h1>
//         {question ? question : "Waiting for a message..."}
//         {/* Chamber */}
//         <Chamber question={question} answer={answer} handleAnswer={handleAnswer}/>
//     </div>
//     );
// }

import Chamber from "./03_Chamber";

export default function Tower(props) {
    return (
        <div className="p-4 bg-red-500 rounded-3xl shadow-lg">
            <h2 className="font-bold text-white mb-2">02 Tower</h2>
            <Chamber {...props} />
        </div>
    );
}