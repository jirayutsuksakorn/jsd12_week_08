// import Gallery from "./07_Gallery";
// export default function Corridor({ question, answer, handleAnswer }) {
//     return (<div className="flex flex-col justify-center items-center pt-10 bg-yellow-500 w-[90%]">
//         <h1>Corridor</h1>
//         {question ? question : "Waiting for a message..."}
//         {/* Gallery */}
//         <Gallery question={question} answer={answer} handleAnswer={handleAnswer}/>
//     </div>
//     );
// }

import Gallery from "./07_Gallery";

export default function Corridor(props) {
    return (
        <div className="p-4 bg-yellow-500 rounded-3xl shadow-lg text-black">
            <h2 className="font-bold mb-2">06 Corridor</h2>
            <Gallery {...props} />
        </div>
    );
}