// import { AxiosError } from "axios";
// import { AppDispatch } from "@/store";
// import { setToastOpen } from "@/store/features/toast/toastSlice";
//
// interface ErrorResponse {
//     message?: string;
// }
//
// export async function handleApi<T>(
//     dispatch: AppDispatch,
//     request: () => Promise<{ data: T }>,
//     successMessage?: string,
//     errorMessage?: string
// ): Promise<T> {
//     try {
//         const {data} = await request();
//
//         if (successMessage) {
//             dispatch(setToastOpen({isOpen: true, message: successMessage}));
//         }
//
//         return data;
//     } catch (error: unknown) {
//         const axiosError = error as AxiosError<ErrorResponse>;
//         const msg =
//             axiosError?.response?.data?.message || errorMessage || "An error occurred";
//
//         dispatch(setToastOpen({isOpen: true, error: msg}));
//         throw msg;
//     }
// }
export function handleApiError(error: any, defaultMessage: string) {
    let message = defaultMessage;
    let errors: string[] = [];
    let traceId: string | undefined;

    if (error.response) {
        const data = error.response.data;

        // FluentValidation style
        if (data?.errors && Array.isArray(data.errors)) {
            errors = data.errors;
            message = data.errors[0] || defaultMessage;
        }
        // Custom API error { message, errors }
        else if (data?.message) {
            message = data.message;
            if (data.errors) errors = data.errors;
        }
    } else if (error.message) {
        message = error.message;
    }

    return { message, errors, traceId };
}
