import React, { useState, useEffect } from 'react';
import { X, Palette, Trash2, Tag, Check } from 'lucide-react';
import { Category } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  categoryToEdit?: Category | null;
  customerCount?: number;
}

const PRESET_COLORS = [
  '#10b981', // Emerald / Verde WhatsApp
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber / Ouro
  '#ea580c', // Orange
  '#84cc16', // Lime
  '#64748b', // Slate
  '#14b8a6', // Teal
];

export const CategoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  categoryToEdit,
  customerCount = 0,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setColor(categoryToEdit.color);
      setDescription(categoryToEdit.description || '');
    } else {
      setName('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setDescription('');
    }
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: categoryToEdit?.id,
      name: name.trim(),
      color,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full shadow-xs"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-base font-bold text-white">
              {categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nome da Categoria <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mesas, Sofás, Geladeiras, Colchões..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                Cor da Categoria & Etiqueta
              </label>
              <span className="text-xs font-mono text-slate-400 uppercase">{color}</span>
            </div>

            {/* Presets grid */}
            <div className="grid grid-cols-6 gap-2 mb-3">
              {PRESET_COLORS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setColor(preset)}
                  style={{ backgroundColor: preset }}
                  className="w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-md hover:scale-105 active:scale-95 cursor-pointer relative"
                >
                  {color.toLowerCase() === preset.toLowerCase() && (
                    <Check className="w-5 h-5 text-white drop-shadow-md stroke-[3]" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Hex Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
              />
              <span className="text-xs text-slate-400">Escolha qualquer tom personalizado</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descrição ou observação (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Modelos em madeira maciça e vidro"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Preview Badge */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Como vai aparecer:</span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs text-white"
              style={{ backgroundColor: color }}
            >
              <Tag className="w-3 h-3" />
              {name.trim() || 'Exemplo Categoria'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {categoryToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (
                    customerCount > 0 &&
                    !window.confirm(
                      `Existem ${customerCount} clientes cadastrados nesta categoria. Deseja realmente excluir?`
                    )
                  ) {
                    return;
                  }
                  onDelete(categoryToEdit.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                {categoryToEdit ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
