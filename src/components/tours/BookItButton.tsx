type BookItButtonProps = {
  href: string;
  label?: string;
};

export default function BookItButton({
  href,
  label = "Book This Tour",
}: BookItButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md bg-[#2f8a3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#287a35]"
    >
      {label}
    </a>
  );
}
