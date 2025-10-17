import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { Event } from '../types';

interface AttendanceConfirmationProps {
  event: Event;
  playerName: string;
  playerId: string;
  parentId: string;
  currentStatus?: 'confirmed' | 'declined' | 'late' | 'pending';
  onConfirm: (status: 'confirmed' | 'declined' | 'late', notes?: string) => void;
}

export function AttendanceConfirmation({
  event,
  playerName,
  // playerId and parentId kept for future use but marked as potentially unused
  playerId: _playerId,
  parentId: _parentId,
  currentStatus = 'pending',
  onConfirm,
}: AttendanceConfirmationProps) {
  const [selectedStatus, setSelectedStatus] = useState<'confirmed' | 'declined' | 'late' | null>(
    currentStatus === 'pending' ? null : (currentStatus as 'confirmed' | 'declined' | 'late')
  );
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const handleStatusSelect = (status: 'confirmed' | 'declined' | 'late') => {
    setSelectedStatus(status);
    if (status === 'declined' || status === 'late') {
      setShowNotes(true);
    } else {
      setShowNotes(false);
      onConfirm(status);
    }
  };

  const handleSubmitWithNotes = () => {
    if (selectedStatus) {
      onConfirm(selectedStatus, notes);
      setShowNotes(false);
      setNotes('');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return 'astăzi';
    if (date.getTime() === tomorrow.getTime()) return 'mâine';

    const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
    return days[date.getDay()];
  };

  const statusConfig = {
    confirmed: {
      icon: CheckCircle2,
      label: 'Va participa',
      color: 'bg-green-100 text-green-800 border-green-200',
      buttonColor: 'bg-green-600 hover:bg-green-700',
    },
    declined: {
      icon: XCircle,
      label: 'Nu va participa',
      color: 'bg-red-100 text-red-800 border-red-200',
      buttonColor: 'bg-red-600 hover:bg-red-700',
    },
    late: {
      icon: Clock,
      label: 'Va întârzia',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    },
    pending: {
      icon: AlertCircle,
      label: 'Așteaptă confirmare',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
    },
  };

  return (
    <Card className="p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Confirmă Prezența
            </Badge>
            {selectedStatus && (
              <Badge variant="outline" className={statusConfig[selectedStatus].color}>
                {statusConfig[selectedStatus].label}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold">
            {playerName} participă la {event.type === 'match' ? 'meci' : 'antrenament'}?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {event.title} • {formatDate(event.date)} la {event.startTime}
          </p>
        </div>

        {/* Status Selection Buttons */}
        {!showNotes && (
          <div className="grid grid-cols-3 gap-2">
            {/* Confirmed */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={selectedStatus === 'confirmed' ? 'default' : 'outline'}
                className={`w-full h-auto flex-col gap-2 p-3 ${
                  selectedStatus === 'confirmed' ? statusConfig.confirmed.buttonColor : ''
                }`}
                onClick={() => handleStatusSelect('confirmed')}
              >
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-xs">DA</span>
              </Button>
            </motion.div>

            {/* Late */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={selectedStatus === 'late' ? 'default' : 'outline'}
                className={`w-full h-auto flex-col gap-2 p-3 ${
                  selectedStatus === 'late' ? statusConfig.late.buttonColor : ''
                }`}
                onClick={() => handleStatusSelect('late')}
              >
                <Clock className="w-6 h-6" />
                <span className="text-xs">Întârziere</span>
              </Button>
            </motion.div>

            {/* Declined */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={selectedStatus === 'declined' ? 'default' : 'outline'}
                className={`w-full h-auto flex-col gap-2 p-3 ${
                  selectedStatus === 'declined' ? statusConfig.declined.buttonColor : ''
                }`}
                onClick={() => handleStatusSelect('declined')}
              >
                <XCircle className="w-6 h-6" />
                <span className="text-xs">NU</span>
              </Button>
            </motion.div>
          </div>
        )}

        {/* Notes Input (for declined or late) */}
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div>
              <label className="text-sm font-medium mb-2 block">
                {selectedStatus === 'declined' ? 'Motiv absență (opțional)' : 'Motivul întârzierii (opțional)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  selectedStatus === 'declined'
                    ? 'Ex: Bolnav, programare medicală, etc.'
                    : 'Ex: Program școală, trafic, etc.'
                }
                className="w-full p-3 border rounded-md text-sm min-h-[80px]"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">{notes.length}/200 caractere</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowNotes(false);
                  setSelectedStatus(null);
                  setNotes('');
                }}
              >
                Anulează
              </Button>
              <Button
                className={`flex-1 ${selectedStatus ? statusConfig[selectedStatus].buttonColor : ''}`}
                onClick={handleSubmitWithNotes}
              >
                Confirmă
              </Button>
            </div>
          </motion.div>
        )}

        {/* Info Message */}
        {!showNotes && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Antrenorul va primi notificare instant cu confirmarea ta.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
