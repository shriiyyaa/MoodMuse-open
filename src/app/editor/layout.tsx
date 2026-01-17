import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Song Vector Editor - MoodMuse',
    description: 'Manually fix song emotional vectors',
};

export default function EditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
