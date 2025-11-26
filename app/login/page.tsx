import SignIn from "@/components/SignIn";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  return (
    <div className="w-full min-h-screen">
      <div className="w-full h-screen lg:grid lg:grid-cols-2 lg:justify-between">
        <div className="flex flex-col lg:align-top items-start justify-center py-12 px-4 lg:px-32">
         <div className="w-full flex flex-row gap-4 row-start-2 items-center">         
          <h1 className="text-5xl 2xl:text-7xl w-full text-center font-semibold mb-6">SOS CASTER</h1>
          <ThemeToggle />
         </div>
          <p className="w-full text-center">
            Your lightweight farcaster client for emergencies,
          </p>
           <p className="w-full text-center mb-12">
            get started by connecting your neynar signer.
          </p>
          <SignIn />
        </div>
        <div className="hidden bg-black/90 dark:bg-background w-full lg:ml-auto lg:flex h-full place-self-end">
          <div className="w-full h-[50%] self-center">
          <img
            src="/hero.gif"
            alt=""
            width="500"
            height="500"
            style={{ objectPosition: 'left' }}
            className="h-full w-full object-cover dark:brightness-[0.8]"
          />
          </div>
        </div>
      </div>
    </div>
  );
}
