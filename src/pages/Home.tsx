import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import heroPadel from '@/assets/hero-padel.jpg';
import articlePadel from '@/assets/article-padel.jpg';

interface Article {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface Field {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_per_slot: number;
  is_active: boolean | null;
}

const ITEMS_PER_PAGE = 6;

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [heroBanner, setHeroBanner] = useState<string>('');
  const [articlePage, setArticlePage] = useState(1);
  const [fieldPage, setFieldPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalFields, setTotalFields] = useState(0);

  useEffect(() => {
    fetchArticles(articlePage);
    fetchFields(fieldPage);
    fetchHeroBanner();
  }, [articlePage, fieldPage]);

  const fetchArticles = async (page: number) => {
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const [{ data: articles, count }, { data: total }] = await Promise.all([
      supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(from, to),
      supabase
        .from('articles')
        .select('count', { count: 'exact' })
        .eq('is_published', true)
        .single()
    ]);
    
    if (articles) setArticles(articles);
    if (count) setTotalArticles(count);
  };

  const fetchFields = async (page: number) => {
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const [{ data: fields, count }, { data: total }] = await Promise.all([
      supabase
        .from('fields')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('name', { ascending: true })
        .range(from, to),
      supabase
        .from('fields')
        .select('count', { count: 'exact' })
        .eq('is_active', true)
        .single()
    ]);
    
    if (fields) setFields(fields);
    if (count) setTotalFields(count);
  };

  const fetchHeroBanner = async () => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'hero_banner')
      .single();
    
    if (data?.value) setHeroBanner(data.value);
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBanner || heroPadel})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Booking Lapangan Padel
              <span className="block text-primary mt-2">Mudah & Cepat</span>
            </h1>
            <p className="text-xl text-gray-200">
              Nikmati pengalaman bermain padel terbaik dengan sistem booking online yang praktis
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="shadow-glow">
                <Link to="/booking">
                  <Calendar className="mr-2 h-5 w-5" />
                  Booking Sekarang
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mengapa Pilih Kami?</h2>
            <p className="text-muted-foreground">
              Kemudahan dan kenyamanan dalam booking lapangan padel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-elegant">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Booking Online</CardTitle>
                <CardDescription>
                  Pesan lapangan kapan saja, dimana saja dengan sistem online 24/7
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-elegant">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Cek Ketersediaan</CardTitle>
                <CardDescription>
                  Lihat jadwal yang tersedia secara real-time dan pilih waktu yang sesuai
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-all duration-300 hover:shadow-elegant">
              <CardHeader>
                <MapPin className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Lokasi Strategis</CardTitle>
                <CardDescription>
                  Lapangan berkualitas dengan lokasi yang mudah dijangkau
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Fields Section */}
      {fields.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-background/50 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Lapangan Kami</h2>
              <p className="text-muted-foreground">
                Pilih lapangan padel sesuai dengan kebutuhan Anda
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fields.map((field) => (
                <Card key={field.id} className="overflow-hidden hover:shadow-elegant transition-all duration-300">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={field.image_url || heroPadel}
                      alt={field.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{field.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{field.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-lg font-semibold text-primary">
                      Rp {field.price_per_slot.toLocaleString('id-ID')} / Jam
                    </p>
                    <Button asChild className="w-full">
                      <Link to="/booking">
                        <Calendar className="mr-2 h-4 w-4" />
                        Booking Sekarang
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalFields > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFieldPage(p => Math.max(1, p - 1))}
                  disabled={fieldPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {fieldPage} dari {Math.ceil(totalFields / ITEMS_PER_PAGE)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFieldPage(p => Math.min(Math.ceil(totalFields / ITEMS_PER_PAGE), p + 1))}
                  disabled={fieldPage >= Math.ceil(totalFields / ITEMS_PER_PAGE)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Articles Section */}
      {articles.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Artikel & Berita</h2>
              <p className="text-muted-foreground">
                Informasi terbaru seputar padel dan promosi menarik
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-elegant transition-all duration-300">
                  <Link to={`/articles/${article.id}`} className="block group">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.image_url || articlePadel}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">{article.content}</CardDescription>
                    </CardHeader>
                  </Link>
                  <CardContent className="flex justify-between items-center">
                    <Button variant="link" className="p-0 h-auto font-semibold" asChild>
                      <Link to={`/articles/${article.id}`}>
                        Baca Selengkapnya
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {new Date(article.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalArticles > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setArticlePage(p => Math.max(1, p - 1))}
                  disabled={articlePage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {articlePage} dari {Math.ceil(totalArticles / ITEMS_PER_PAGE)}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setArticlePage(p => Math.min(Math.ceil(totalArticles / ITEMS_PER_PAGE), p + 1))}
                  disabled={articlePage >= Math.ceil(totalArticles / ITEMS_PER_PAGE)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Bermain Padel?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Booking lapangan sekarang dan nikmati pengalaman bermain padel terbaik
          </p>
          <Button size="lg" variant="secondary" asChild className="shadow-glow">
            <Link to="/booking">
              Booking Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;