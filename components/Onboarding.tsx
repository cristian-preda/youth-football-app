import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Users, Calendar, Bell, CheckCircle, Shield, UserCircle, Award } from 'lucide-react';
import type { UserRole } from '../types';

interface OnboardingProps {
  onComplete: (selectedRole: UserRole) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roleOptions = [
    {
      role: 'coach' as UserRole,
      title: 'Antrenor',
      description: 'Gestionează echipa, antrenamente și meciuri',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      role: 'director' as UserRole,
      title: 'Director',
      description: 'Supervizează clubul și toate echipele',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      role: 'parent' as UserRole,
      title: 'Părinte',
      description: 'Urmărește progresul copilului tău',
      icon: UserCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      role: 'player' as UserRole,
      title: 'Jucător',
      description: 'Vezi statisticile și programul tău',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const steps = [
    {
      title: 'Bine ai venit!',
      subtitle: 'Platforma de fotbal pentru copii din România',
      content: (
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h2 className="mb-2">Fotbal pentru Copii</h2>
            <p className="text-muted-foreground">
              Organizează echipa, urmărește progresul jucătorilor și comunică eficient cu toți membrii clubului.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Program antrenamente & meciuri</div>
                <div className="text-sm text-muted-foreground">Toate evenimentele într-un singur loc</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Prezență în timp real</div>
                <div className="text-sm text-muted-foreground">Confirmă participarea rapid</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Comunicare directă</div>
                <div className="text-sm text-muted-foreground">Mesaje între antrenori și părinți</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Alege rolul tău',
      subtitle: 'Pentru o experiență personalizată',
      content: (
        <div className="space-y-3">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.role;
            return (
              <button
                key={option.role}
                onClick={() => setSelectedRole(option.role)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${option.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">{option.title}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Gata de start!',
      subtitle: 'Hai să începem',
      content: (
        <div className="text-center space-y-6">
          <CheckCircle className="w-20 h-20 mx-auto text-green-600" />
          <div>
            <h2 className="mb-2">Totul este pregătit!</h2>
            <p className="text-muted-foreground">
              Vei vedea dashboard-ul personalizat pentru rolul de{' '}
              <span className="font-medium text-foreground">
                {roleOptions.find(r => r.role === selectedRole)?.title}
              </span>.
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg text-left">
            <h4 className="mb-3">Ce poți face:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {selectedRole === 'coach' && (
                <>
                  <li>• Marchează prezența la antrenamente</li>
                  <li>• Adaugă meciuri și rezultate</li>
                  <li>• Comunică cu părinții</li>
                  <li>• Urmărește statistici jucători</li>
                </>
              )}
              {selectedRole === 'director' && (
                <>
                  <li>• Vezi toate echipele clubului</li>
                  <li>• Monitorizează prezența generală</li>
                  <li>• Accesează rapoarte complete</li>
                  <li>• Gestionează antrenorii</li>
                </>
              )}
              {selectedRole === 'parent' && (
                <>
                  <li>• Vezi programul copilului tău</li>
                  <li>• Confirmă sau scuză absențe</li>
                  <li>• Urmărește statistici și progres</li>
                  <li>• Comunică cu antrenorul</li>
                </>
              )}
              {selectedRole === 'player' && (
                <>
                  <li>• Vezi propriile statistici</li>
                  <li>• Consultă programul meciurilor</li>
                  <li>• Urmărește progresul tău</li>
                  <li>• Vezi istoricul medical</li>
                </>
              )}
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (selectedRole) {
        onComplete(selectedRole);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return selectedRole !== null;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Pasul {currentStep + 1} din {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h1>{currentStepData.title}</h1>
            <p className="text-muted-foreground">{currentStepData.subtitle}</p>
          </div>
          {currentStepData.content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1"
          >
            Înapoi
          </Button>
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? 'Începe' : 'Următorul'}
          </Button>
        </div>
      </Card>
    </div>
  );
}