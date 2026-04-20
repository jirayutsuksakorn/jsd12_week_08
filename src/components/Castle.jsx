import Tower from "./Tower";

export default function Castle() {
    return (<div className="flex flex-col justify-center items-center pt-10 bg-red-500 w-full">
        <h1>Castle</h1>
        <Tower />
    </div>
    );
};