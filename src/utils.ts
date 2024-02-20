export const toUtf8 = (input: string) => {
    return Buffer.from(input, 'utf-8').toString();
}