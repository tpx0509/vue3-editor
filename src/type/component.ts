
export type componentConfig = {
    label: string,
    preview: () => JSX.Element,
    render: () => JSX.Element,
    key: string,
    props: {
        [key: string]: {
            type: string,
            [key:string]: any
        }
    }
}