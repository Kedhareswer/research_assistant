# AI-Powered Research Assistant 🔬

A comprehensive AI-powered research assistant that transforms how you conduct academic research. Get real-time information, intelligent summaries, and automatic citations in multiple academic formats.

![Research Assistant Demo](https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop)

## ✨ Features

### 🔍 Intelligent Research
- **Real-time Web Search**: Access the latest information from multiple sources
- **Academic Database Integration**: Connect to arXiv, PubMed, and open access repositories
- **AI-Powered Summarization**: Get comprehensive summaries in your preferred tone
- **Multi-source Analysis**: Cross-reference information for accuracy

### 📚 Citation Management
- **Multiple Citation Styles**: APA, MLA, IEEE, Chicago, BibTeX
- **Automatic Generation**: AI-powered citation formatting
- **In-text Citations**: Proper inline reference insertion
- **Export Options**: Download citations in various formats

### 🎯 Advanced Features
- **Tone Customization**: Academic, journalistic, casual, or technical writing styles
- **Key Insights Extraction**: Identify crucial findings and trends
- **Related Topics**: Discover connected research areas
- **Source Relevance Scoring**: AI-ranked source quality assessment

### 📄 Export & Sharing
- **PDF Reports**: Generate formatted research documents
- **Markdown Export**: Platform-agnostic text format
- **Bibliography Export**: Reference manager compatibility
- **Copy-to-Clipboard**: Quick citation copying

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-research-assistant.git
   cd ai-research-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   LANGSEARCH_API_KEY=your_langsearch_api_key_here
   BRAVE_API_KEY=your_brave_search_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Basic Research Query
1. Enter your research topic or question in the main input field
2. Select your preferred citation style (APA, MLA, IEEE, etc.)
3. Choose the writing tone (Academic, Journalistic, Casual, Technical)
4. Click "Start Research" to begin the analysis

### Example Queries
- `"Explain how AI is used in climate modeling"`
- `"Impact of renewable energy on economic growth"`
- `"Latest developments in quantum computing applications"`
- `"Social media effects on mental health in teenagers"`

### Working with Results
- **Summary Tab**: Read the AI-generated comprehensive summary
- **Sources Tab**: Review all sources with relevance scores
- **Insights Tab**: Key findings and important points
- **Related Tab**: Discover connected research topics

### Citation Management
- View auto-generated citations in your chosen format
- Copy individual citations to clipboard
- Export entire bibliography
- Use in-text citation format in your writing

## 🛠️ Technology Stack

### Backend
- **Next.js API Routes**: Serverless backend
- **Vercel AI SDK**: AI model integration
- **Groq Llama-3.3**: Fast, efficient language model for summarization
- **Google Gemini**: Advanced AI for citation formatting and analysis
- **LangSearch API**: Hybrid web search with semantic reranking
- **Brave Search API**: Privacy-focused web search
- **Custom Citation Engine**: Multi-format citation generation

### AI Models & APIs
- **Groq Llama-3.3-70B**: Primary research summarization
- **Groq Llama-3.3-70B-SpeDec**: Fast insights extraction
- **Google Gemini-1.5-Pro**: Citation formatting and analysis
- **Google Gemini-1.5-Flash**: Related topics generation
- **LangSearch Hybrid Search**: Combines keyword and vector search
- **LangSearch Reranker**: Semantic result reranking
- **Brave Search**: Privacy-focused web search

### Deployment
- **Vercel**: Optimized hosting platform
- **Edge Runtime**: Fast global performance
- **Serverless Functions**: Scalable backend processing

## 🔧 Configuration

### Citation Styles
The system supports multiple citation formats:

```typescript
const citationStyles = {
  apa: "American Psychological Association",
  mla: "Modern Language Association", 
  ieee: "Institute of Electrical and Electronics Engineers",
  chicago: "Chicago Manual of Style",
  bibtex: "BibTeX format for LaTeX"
}
```

### Writing Tones
Customize the AI output tone:

```typescript
const writingTones = {
  academic: "Formal, scholarly language with technical precision",
  journalistic: "Clear, engaging style for general audiences", 
  casual: "Conversational, accessible language",
  technical: "Specialized terminology for expert audiences"
}
```

### Search Services Setup

#### LangSearch API
1. Sign up at [LangSearch](https://langsearch.com/api-keys)
2. Get your free API key
3. Add to `.env.local` as `LANGSEARCH_API_KEY`

**Features:**
- Hybrid search combining keywords and vectors
- Semantic reranking for enhanced accuracy
- Long-text summaries with markdown support
- Free tier for individuals and small teams

#### Brave Search API
1. Sign up at [Brave Search API](https://api.search.brave.com/)
2. Get your API key
3. Add to `.env.local` as `BRAVE_API_KEY`

**Features:**
- Privacy-focused web search
- No tracking or profiling
- Fresh, independent search results
- Backup search service

## 📊 API Reference

### Research Endpoint
```typescript
POST /api/research
{
  "query": "Your research question",
  "citationStyle": "apa" | "mla" | "ieee" | "chicago" | "bibtex",
  "tone": "academic" | "journalistic" | "casual" | "technical",
  "databases": ["web", "academic", "arxiv"]
}
```

### Response Format
```typescript
{
  "summary": "AI-generated research summary with citations",
  "sources": [
    {
      "title": "Source title",
      "url": "Source URL", 
      "snippet": "Relevant excerpt",
      "relevance": 0.95,
      "type": "academic" | "web",
      "year": "2024",
      "authors": ["Author Name"]
    }
  ],
  "citations": [
    {
      "id": "cite-1",
      "formatted": "Full citation in requested format",
      "inText": "(Author, 2024)",
      "type": "academic"
    }
  ],
  "keyInsights": ["Key finding 1", "Key finding 2"],
  "relatedTopics": ["Related topic 1", "Related topic 2"]
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing code formatting (Prettier)
- Add JSDoc comments for functions
- Write tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing advanced language models
- **Vercel** for excellent hosting and AI SDK
- **shadcn/ui** for beautiful UI components
- **Academic Community** for open access research initiatives

## 📞 Support

- **Documentation**: [Full documentation](https://docs.example.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/ai-research-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-research-assistant/discussions)
- **Email**: support@example.com

## 🗺️ Roadmap

### Version 2.0
- [ ] Browser extension for direct web research
- [ ] Mobile applications (iOS/Android)
- [ ] Real-time collaboration features
- [ ] Advanced analytics and insights

### Version 3.0
- [ ] Institutional integrations (universities, libraries)
- [ ] API access for third-party developers
- [ ] Advanced AI research assistant chat
- [ ] Automated literature review generation

---

**Made with ❤️ for the research community**

*Empowering researchers, students, and writers with AI-powered tools for better, faster, and more accurate research.*
