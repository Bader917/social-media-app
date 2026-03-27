import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { LuLoader } from "react-icons/lu";
import { useState } from "react";
import axios from "axios";
import z from "zod";

export default function Settings() {

    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isError, setIsError] = useState({ password: "", newPassword: "" });

    const changePassSchema = z.object({
        password: z.string()
            .nonempty("Old Password is required"),

        newPassword: z.string()
            .min(8, 'Password Must 8 Char Or More')
            .max(25, 'Max Char is 25 Char')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/, 'Password Must Be Capital Char Or More, Numbers'),
    });

    const handleChangePassword = () => {
        const result = changePassSchema.safeParse({ password, newPassword });

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setIsError({
                password: errors.password?.[0],
                newPassword: errors.newPassword?.[0],
            });
            return;
        }

        mutate(result.data);
    };

    async function changePassword(inputsData) {
        const response = await axios.patch(`https://route-posts.routemisr.com/users/change-password`, inputsData,
            {
                headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
            }
        );

        return response;
    };

    const { mutate, isPending } = useMutation({
        mutationFn: changePassword,
        mutationKey: ["changePassword"],
        onMutate: () => {
            toast.loading("Password Will Update", { id: 'update' });
        },
        onSuccess: (res) => {
            const newToken = res?.data?.data?.token;
            if (newToken) {
                localStorage.setItem('userToken', newToken);
            }

            toast.success("Password Changed", { id: 'update' });

            setPassword('');
            setNewPassword('');
            setIsError({ password: "", newPassword: "" });
        },
        onError: (err) => {
            console.log(err);
            toast.error("Failed to update password", { id: 'update' });
        }
    });

    return (
        <div className="w-full max-w-2xl mx-auto sm:max-w-3xl lg:max-w-4xl p-2 sm:px-4 flex items-center justify-center">
            <form className="bg-white p-5 mt-3 w-100 rounded-md">
                <div className="flex items-center justify-center">
                    <h3 className="text-2xl">Change Password</h3>
                </div>
                <div className="flex flex-col gap-1 mt-5">
                    <label htmlFor="old-pass" className="text-gray-500">old password</label>
                    <input
                        className="w-full p-1 bg-gray-100 rounded-md outline-0"
                        id="old-pass"
                        placeholder="Enter your old password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {
                        isError.password && <p className='py-1 px-2 m-2 rounded-4xl bg-red-400 font-semibold text-white text-[16px]'>{isError.password}</p>
                    }
                </div>

                <div className="flex flex-col gap-1 mt-5">
                    <label htmlFor="new-pass" className="text-gray-500">new password</label>
                    <input
                        className="w-full p-1 bg-gray-100 rounded-md outline-0"
                        id="new-pass"
                        placeholder="Enter your new password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />

                    {isError.newPassword &&
                        <p className='py-1 px-2 m-2 w-full rounded-4xl bg-red-400 text-white font-semibold text-[16px]'>
                            {isError.newPassword}
                        </p>
                    }
                </div>

                <button className="cursor-pointer py-1 px-2 text-center disabled:bg-gray-400 bg-primary-500 disabled:cursor-not-allowed text-white font-semibold mt-5 w-full rounded-md"
                    onClick={handleChangePassword} type="button" disabled={isPending}
                >
                    <div className="flex items-center justify-center">
                        {
                            isPending ? < LuLoader className="animate-spin text-primary-500" size={30} /> : "Confirm"
                        }
                    </div>
                </button>
            </form>
        </div>
    )
}