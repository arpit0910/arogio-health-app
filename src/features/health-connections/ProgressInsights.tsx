import { AccessibleText as Text } from '../../components/ui/AccessibleText';
import { View } from 'react-native';
import { useCareStyles } from '../../components/app/CareUI';
import { useTranslation } from '../../localization/LanguageProvider';
import { localDay } from '../personal-wellness/domain';
import { formatHealthValue, type HealthMetric, type HealthSnapshot } from './model';
import { progressInsights } from './insights';

export function ProgressInsights({ snapshot, metric, goal, today = localDay() }: { snapshot: HealthSnapshot; metric: HealthMetric; goal?: number; today?: string }) {
  const c = useCareStyles(), { t } = useTranslation();
  const insight = progressInsights(snapshot, metric, goal, today);
  if (!insight.recorded) return null;
  return <View style={{ gap: 10, paddingVertical: 16 }}>
    <Text accessibilityRole="header" style={c.title}>{t('What your readings tell you')}</Text>
    {insight.average != null && <Text style={c.text}>{t('Average per completed day')}: {formatHealthValue(metric, insight.average)} {t(insight.unit)} · {insight.completed} {t('recorded days')}</Text>}
    {insight.goalDays != null && <Text style={c.text}>{t('Days reaching your current target')}: {insight.goalDays} / {insight.completed} {t('completed days')}</Text>}
    {insight.remaining != null && <Text style={c.text}>{insight.remaining === 0 ? t('Your target for today is reached.') : `${t('Remaining to your target today')}: ${formatHealthValue(metric, insight.remaining)} ${t(insight.unit)}`}</Text>}
    {insight.latestDay && insight.latestDay < today && <Text style={c.text}>{t('Latest recorded day')}: {insight.latestDay}. {t('Today has no reading yet.')}</Text>}
    {insight.completed === 0 && <Text style={c.text}>{t('Today is still in progress. Completed-day insights will appear when more readings are available.')}</Text>}
    <Text style={[c.text, { fontSize: 12 }]}>{t('Missing days are excluded, not counted as zero. Targets are your saved preferences, not a health assessment.')}</Text>
  </View>;
}
