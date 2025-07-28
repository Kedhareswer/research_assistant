# AI-Powered Research Assistant 🔬

A comprehensive AI-powered research assistant that transforms how you conduct academic research. Get real-time information, intelligent summaries, and automatic citations in multiple academic formats.

## ✨ Features

### 🔍 Intelligent Research
- **Real-time Web Search**: Access the latest information from multiple sources including DuckDuckGo, Wikipedia, arXiv, and PubMed
- **Academic Database Integration**: Connect to arXiv, PubMed, and open access repositories
- **AI-Powered Summarization**: Get comprehensive summaries in your preferred tone using Groq and Google Gemini
- **Multi-source Analysis**: Cross-reference information for accuracy with fallback search sources

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
- pnpm (recommended) or npm
- API keys for AI services (Groq, Google Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kedhareswer/ai-research-assistant.git
   cd ai-research-assistant
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Add your API keys:
   ```env
   # AI Model API Keys (Required)
   GROQ_API_KEY=your_groq_api_key_here
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
   
   # Search API Keys (Optional - fallback sources will be used)
   LANGSEARCH_API_KEY=your_langsearch_api_key_here
   BRAVE_API_KEY=your_brave_search_api_key_here
   
   # Next.js Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
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
- **Next.js 15**: React framework with API routes
- **Vercel AI SDK**: AI model integration
- **Groq Llama-3.1-8b-instant**: Fast, efficient language model for summarization
- **Google Gemini-1.5-Flash**: Advanced AI for citation formatting and analysis
- **Fallback Search Services**: DuckDuckGo, Wikipedia, arXiv, PubMed
- **Custom Citation Engine**: Multi-format citation generation

### AI Models & APIs
- **Groq Llama-3.1-8b-instant**: Primary research summarization
- **Google Gemini-1.5-Flash**: Citation formatting and analysis
- **Fallback Search**: Multiple sources for comprehensive research
- **Error Handling**: Graceful fallbacks when APIs are unavailable

### Frontend
- **React 19**: Modern UI framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible components
- **Next.js App Router**: Modern routing and layouts

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

#### Required API Keys
- **Groq API Key**: Required for AI summarization and analysis
- **Google Gemini API Key**: Required for citation formatting and insights

#### Optional API Keys
- **LangSearch API**: Enhanced web search with semantic reranking
- **Brave Search API**: Privacy-focused web search backup

**Fallback Sources**: The system automatically uses DuckDuckGo, Wikipedia, arXiv, and PubMed when premium APIs are unavailable.

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

- **Groq** for providing fast, efficient language models
- **Google** for Gemini AI capabilities
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
