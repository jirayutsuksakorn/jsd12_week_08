import Gallery from "./07_Gallery"

export default function Corridor({question, answer, handleAnswer}) {
  return (
    <div className="flex flex-col justify-center items-center pt-10 bg-blue-500 w-[90%]">
      <h1>Corridor</h1>
      {/* Gallery */}
      <Gallery question={question} answer={answer} handleAnswer={handleAnswer} />
    </div>
  );
}