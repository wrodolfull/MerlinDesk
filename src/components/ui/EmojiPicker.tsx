// src/components/ui/EmojiPicker.tsx
import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘']
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖']
  },
  {
    name: 'Objects',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬']
  }
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  return (
    <div className="p-2 max-h-60 overflow-y-auto">
      {EMOJI_CATEGORIES.map((category) => (
        <div key={category.name} className="mb-3">
          <h3 className="text-xs font-medium text-gray-500 mb-1">{category.name}</h3>
          <div className="grid grid-cols-8 gap-1">
            {category.emojis.map((emoji) => (
              <button
                key={emoji}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-xl"
                onClick={() => onEmojiSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmojiPicker;
