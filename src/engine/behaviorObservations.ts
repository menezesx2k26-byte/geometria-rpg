import type { AttemptV4, BehaviorObservation } from '../types/competency';

export function inferBehaviorObservations(attempt: AttemptV4, previousAttempts: AttemptV4[]): BehaviorObservation[] {
  const observations: BehaviorObservation[] = [];
  const add = (softSkillId: BehaviorObservation['softSkillId'], event: string) => {
    observations.push({
      id: `${attempt.id}:${softSkillId}:${observations.length}`,
      softSkillId,
      challengeId: attempt.challengeId,
      event,
      observedAt: attempt.attemptedAt,
    });
  };

  const priorError = previousAttempts.some((item) =>
    item.challengeId === attempt.challengeId
    && item.stepId === attempt.stepId
    && item.status === 'rejected');

  if (attempt.status === 'accepted' && priorError) add('S2', 'Nova tentativa correta após um impasse no mesmo passo.');
  if (attempt.assessment.verification !== null) add('S3', 'A etapa permitiu observar verificação da conclusão.');
  if (attempt.assessment.justification === 1) add('S5', 'A justificativa esperada foi registrada corretamente nesta tentativa.');
  if (attempt.status === 'accepted' && attempt.hintEvents.length === 0 && attempt.assessment.independence === 1) {
    add('S7', 'A etapa foi concluída sem uso de pistas.');
  }

  return observations;
}

export function trimBehaviorObservations(observations: BehaviorObservation[], now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - 30);
  return observations
    .filter((item) => new Date(item.observedAt) >= cutoff)
    .slice(-100);
}
