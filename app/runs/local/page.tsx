import ImportedRun from "@/components/ImportedRun";

export const metadata = {
  title: "Imported run",
  description:
    "A Witness run loaded from a local JSON file. It never leaves this browser.",
};

export default function LocalRunPage() {
  return <ImportedRun />;
}
