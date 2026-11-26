import { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { AppIcon } from '../../components/app/AppIcon';
import { AccessibleText as Text, AccessibleTextInput as TextInput } from '../../components/ui/AccessibleText';
import { Button } from '../../components/ui/Button';
import { TouchTarget } from '../../components/ui/TouchTarget';
import { useTranslation } from '../../localization/LanguageProvider';
import type { Article, ArticleCategory, ArticleSort } from '../../services/api/healthResourcesApi';
import { colors } from '../../theme/tokens';
import { ArticleThumbnail } from './ArticleThumbnail';
import { articleLibraryStyles as s } from './articleLibraryStyles';

export function IconButton({ icon, label, onPress, selected, disabled = false }: {
  icon: 'bookmark' | 'filter'; label: string; onPress: () => void; selected?: boolean; disabled?: boolean;
}) {
  const { t } = useTranslation();
  return <TouchTarget accessibilityRole="button" accessibilityLabel={t(label)} accessibilityState={{ selected, disabled }}
    disabled={disabled} onPress={onPress} style={[s.iconButton, selected && s.selectedIcon]}>
    <AppIcon name={icon} size={21} color={selected ? colors.primaryPressed : colors.muted} filled={selected} />
  </TouchTarget>;
}

type HeaderProps = {
  search: string;
  setSearch: (text: string) => void;
  submitSearch: () => void;
  category: string;
  setCategory: (value: string) => void;
  topics: ArticleCategory[];
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  sort: ArticleSort;
  setSort: (sort: ArticleSort) => void;
  reset: () => void;
  error: string;
};

const sorts = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title_asc', label: 'Title A–Z' },
  { value: 'title_desc', label: 'Title Z–A' },
] as const;

export function LibraryHeader(props: HeaderProps) {
  const { t, language } = useTranslation();
  const { search, setSearch, submitSearch, category, setCategory, topics, filtersOpen, setFiltersOpen, sort, setSort } = props;
  return <View style={s.header}>
    <View style={s.searchRow}>
      <View style={s.search}>
        <AppIcon name="search" color={colors.muted} size={19} />
        <TextInput accessibilityLabel={t('Search health articles')} value={search} onChangeText={setSearch}
          placeholder={t('Search articles')} placeholderTextColor={colors.placeholder}
          returnKeyType="search" maxLength={150} onSubmitEditing={submitSearch} style={s.searchInput} />
        {!!search.length && <TouchTarget accessibilityRole="button" accessibilityLabel={t('Clear search')} onPress={() => setSearch('')} style={s.iconButton}>
          <AppIcon name="close" size={16} />
        </TouchTarget>}
      </View>
      <IconButton icon="filter" label={filtersOpen ? 'Close filters' : 'Open article filters'} selected={filtersOpen} onPress={() => setFiltersOpen(!filtersOpen)} />
    </View>
    {topics.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel={t('Article topics')}
      keyboardShouldPersistTaps="handled" contentContainerStyle={s.topics}>
      {[{ name: '', name_hi: '' }, ...topics].map(topic => <TouchTarget key={topic.name} accessibilityRole="button"
        accessibilityState={{ selected: category === topic.name }} onPress={() => setCategory(topic.name)}
        style={[s.topic, category === topic.name && s.selectedTopic]}>
        <Text style={[s.label, category === topic.name && s.selectedLabel]}>
          {language === 'hi' && topic.name_hi ? topic.name_hi : t(topic.name || 'All Articles')}
        </Text>
      </TouchTarget>)}
    </ScrollView>}
    {filtersOpen && <View style={s.filters}>
      <Text accessibilityRole="header" style={s.rowTitle}>{t('Sort articles')}</Text>
      <View style={s.sortOptions}>
        {sorts.map(option => <TouchTarget key={option.value} accessibilityRole="radio" accessibilityState={{ checked: sort === option.value }}
          onPress={() => setSort(option.value)} style={[s.topic, sort === option.value && s.selectedTopic]}>
          <Text style={[s.label, sort === option.value && s.selectedLabel]}>{t(option.label)}</Text>
        </TouchTarget>)}
      </View>
      <Button title={t('Clear filters')} variant="secondary" onPress={props.reset} />
    </View>}
    {!!props.error && <Text accessibilityRole="alert" style={s.error}>{t(props.error)}</Text>}
  </View>;
}

export function LibraryArticleCard({ article, saved, toggleSaved, saving = false }: {
  article: Article; saved: boolean; toggleSaved: () => void; saving?: boolean;
}) {
  const { language, t } = useTranslation(), router = useRouter(), { fontScale } = useWindowDimensions();
  const title = (language === 'hi' && article.title_hi) || article.title_en;
  const excerpt = (language === 'hi' && article.excerpt_hi) || article.excerpt_en;
  const category = (language === 'hi' && article.category_hi) || article.category;
  const minutes = language === 'hi' ? article.reading_minutes_hi ?? article.reading_minutes_en : article.reading_minutes_en;
  const meta = [category, minutes ? minutes + ' ' + t('min read') : ''].filter(Boolean).join(' · ');
  const open = () => router.push({ pathname: '/articles/[id]', params: { id: article.id } });
  const bookmarkLabel = (saved ? t('Remove saved article') : t('Save article')) + ': ' + title;
  return <View style={s.article}>
    <TouchTarget accessibilityRole="button" accessibilityLabel={title} onPress={open}
      style={({ pressed }) => ({ opacity: pressed ? 0.76 : 1 })}>
      <ArticleThumbnail thumbnailUrl={article.thumbnail_url} imageUrl={article.image_url} style={s.cover} />
      <View style={s.articleCopy}>
        {!!meta && <Text style={s.meta}>{meta}</Text>}
        <Text style={s.articleTitle}>{title}</Text>
        {!!excerpt && <Text style={s.body} numberOfLines={fontScale >= 1.3 ? undefined : 3}>{excerpt}</Text>}
      </View>
    </TouchTarget>
    <View style={s.bookmark}>
      <IconButton icon="bookmark" selected={saved} disabled={saving} label={bookmarkLabel} onPress={toggleSaved} />
    </View>
  </View>;
}

export function LibraryQuestion({ question, setQuestion, onSend }: {
  question: string; setQuestion: (value: string) => void; onSend: () => void;
}) {
  const { t } = useTranslation(), [expanded, setExpanded] = useState(false);
  return <View style={s.question}>
    <TouchTarget accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={s.questionToggle}>
      <Text style={s.label}>{t(expanded ? 'Close Jeeva question' : 'Ask Jeeva')}</Text>
      <AppIcon name={expanded ? 'close' : 'right'} size={18} />
    </TouchTarget>
    {expanded && <>
      <TextInput accessibilityLabel={t('Question for Jeeva')} placeholder={t('Question for Jeeva')}
        placeholderTextColor={colors.placeholder} value={question} onChangeText={setQuestion} onSubmitEditing={onSend}
        returnKeyType="send" maxLength={2000} style={[s.searchInput, s.questionInput]} />
      <Button title={t('Ask Jeeva')} onPress={onSend} disabled={!question.trim()} />
    </>}
  </View>;
}
