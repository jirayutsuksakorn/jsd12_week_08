// import SecretRoom from "./09_SecretRoom";
// export default function Nook({ question, answer, handleAnswer }) {
//     return (<div className="flex flex-col justify-center items-center pt-10 bg-green-500 w-[90%]">
//         <h1>Nook</h1>
//         {question ? question : "Waiting for a message..."}
//         {/* SecretRoom */}
//         <SecretRoom question={question} answer={answer} handleAnswer={handleAnswer}/>
//     </div>
//     );
// }

import SecretRoom from "./09_SecretRoom";

export default function Nook(props) {
    return (
        <div className="p-4 bg-green-500 rounded-3xl shadow-lg">
            <h2 className="font-bold text-white mb-2">08 Nook</h2>
            <SecretRoom {...props} />
        </div>
    );
}