export type ErrorViewProps = {
    error: Error
}

export default function ErrorView(props: ErrorViewProps) {
    return <div className="flex w-screen h-screen items-center justify-center">
        <h1 className="font-bold text-red-500 text-2xl">Error Occured</h1>
        <p>{props.error.message}</p>
    </div>
}