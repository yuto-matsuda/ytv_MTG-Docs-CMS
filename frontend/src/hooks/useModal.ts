import { useState } from 'react';

export default function useModal(): [(modalId: string) => boolean, (modalId: string) => void, () => void] {
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const isOpen = (modalId: string) => activeModal === modalId;
    const openModal   = (modalId: string) => {
        setActiveModal(modalId);
        document.body.style.overflow = 'hidden';
    }
    const closeModal  = () => {
        setActiveModal(null);
        document.body.style.overflow = '';
    }

    return [isOpen, openModal, closeModal];
}