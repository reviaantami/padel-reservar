import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { id } from 'date-fns/locale'

interface Article {
  id: string
  title: string
  content: string
  image_url: string
  created_at: string
  slug: string
  created_by: string
  author: {
    full_name: string
  }
}

export default function ArticlePage() {
  const { id: slugOrId } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticle() {
      try {
        let query = supabase
          .from('articles')
          .select(`
            *,
            author:profiles!articles_created_by_fkey (
              full_name
            )
          `)

        // regex cek apakah UUID valid
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId!)

        if (isUUID) {
          query = query.eq('id', slugOrId)
        } else {
          query = query.eq('slug', slugOrId)
        }

        const { data: articleData, error: articleError } = await query.single()

        if (articleError) throw articleError
        setArticle(articleData)
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slugOrId) fetchArticle()
  }, [slugOrId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <Link to="/">
          <Button variant="link" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/">
        <Button variant="outline" size="sm" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Button>
      </Link>

      <h1 className="text-4xl font-bold tracking-tight mb-6">{article.title}</h1>

      <div className="flex items-center gap-6 text-muted-foreground mb-8">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{article.author?.full_name || 'Anonymous'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <time>{format(new Date(article.created_at), 'dd MMMM yyyy', { locale: id })}</time>
        </div>
      </div>

      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-[400px] object-cover rounded-lg mb-8"
        />
      )}

      <div className="prose prose-lg max-w-none">
        {article.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}
