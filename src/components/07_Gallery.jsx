// import Nook from "./08_Nook";
// export default function Gallery({ question, answer, handleAnswer }) {
//     return (<div className="flex flex-col justify-center items-center pt-10 bg-blue-500 w-[90%]">
//         <h1>Gallery</h1>
//         {question ? question : "Waiting for a message..."}
//         {/* Nook*/}
//         <Nook question={question} answer={answer} handleAnswer={handleAnswer}/>
//     </div>
//     );
// }

import Nook from "./08_Nook";

export default function Gallery(props) {
    return (
        <div className="p-4 bg-blue-500 rounded-3xl shadow-lg">
            <h2 className="font-bold text-white mb-2">07 Gallery</h2>
            <Nook {...props} />
        </div>
    );
}