export const Footer = () => {
  return (
      <div className="row-start-3 flex flex-col gap-4 text-xs sm:text-sm md:text-md">
        <footer className="row-start-3 flex gap-6 pt-16 flex-wrap items-center justify-center font-[family-name:var(--font-geist-mono)]">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/jvaleskadevs/sos-caster"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/*
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />*/}
            Github →
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://join.base.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
          {/*
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />*/}
            TBA →
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://farcaster.xyz/~/channel/farcaster"
            target="_blank"
            rel="noopener noreferrer"
          >
          {/*
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />*/}
            Farcaster →
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://neynar.com"
            target="_blank"
            rel="noopener noreferrer"
          >
          {/*
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />*/}
            Neynar →
          </a>
        </footer>
        <p className="w-full text-muted-foreground text-center opacity-[.8] mt-2">
          Made with 💜️ by <span><a
            className="hover:underline hover:underline-offset-4"
            href="https://farcaster.xyz/jvaleska.eth"
            target="_blank"
            rel="noopener noreferrer"
          >J.Valeska</a></span>
        </p>
      </div>  
  );
}
