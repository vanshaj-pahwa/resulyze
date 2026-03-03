/**
 * Static skill normalization map.
 * Maps common aliases/abbreviations to canonical skill names.
 * Used by JD processing and SkillMatchPanel for consistent matching.
 */
export const SKILL_ALIASES: Record<string, string> = {
  // JavaScript ecosystem
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'es6': 'JavaScript',
  'es2015': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'reactjs': 'React',
  'react.js': 'React',
  'react js': 'React',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'next js': 'Next.js',
  'vuejs': 'Vue',
  'vue.js': 'Vue',
  'vue js': 'Vue',
  'angularjs': 'Angular',
  'angular.js': 'Angular',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'node js': 'Node.js',
  'expressjs': 'Express',
  'express.js': 'Express',

  // Python ecosystem
  'py': 'Python',
  'python3': 'Python',
  'django rest framework': 'Django',
  'drf': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',

  // Databases
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'psql': 'PostgreSQL',
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'mysql': 'MySQL',
  'mssql': 'SQL Server',
  'ms sql': 'SQL Server',
  'dynamodb': 'DynamoDB',
  'redis': 'Redis',

  // Cloud & DevOps
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'google cloud platform': 'GCP',
  'azure': 'Azure',
  'microsoft azure': 'Azure',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'docker': 'Docker',
  'terraform': 'Terraform',
  'tf': 'Terraform',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',

  // Languages
  'golang': 'Go',
  'go': 'Go',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'c sharp': 'C#',
  'rb': 'Ruby',
  'ruby': 'Ruby',
  'ror': 'Ruby on Rails',
  'ruby on rails': 'Ruby on Rails',
  'rails': 'Ruby on Rails',

  // Data & ML
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',
  'dl': 'Deep Learning',
  'deep learning': 'Deep Learning',
  'ai': 'Artificial Intelligence',
  'nlp': 'NLP',
  'natural language processing': 'NLP',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scipy': 'SciPy',
  'sklearn': 'scikit-learn',
  'scikit-learn': 'scikit-learn',

  // Tools & Misc
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'jira': 'Jira',
  'confluence': 'Confluence',
  'figma': 'Figma',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'graphql': 'GraphQL',
  'gql': 'GraphQL',
  'rest': 'REST APIs',
  'restful': 'REST APIs',
  'rest api': 'REST APIs',
  'rest apis': 'REST APIs',
  'grpc': 'gRPC',
  'rabbitmq': 'RabbitMQ',
  'kafka': 'Kafka',
  'elasticsearch': 'Elasticsearch',
  'es': 'Elasticsearch',
}

/**
 * Normalize a skill name to its canonical form.
 * Returns the canonical name if an alias exists, otherwise returns the original.
 */
export function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase().trim()
  return SKILL_ALIASES[lower] || skill
}

/**
 * Check if two skill strings refer to the same skill.
 */
export function skillsMatch(a: string, b: string): boolean {
  const normA = normalizeSkill(a).toLowerCase()
  const normB = normalizeSkill(b).toLowerCase()
  return normA === normB
}

/**
 * Deduplicate a list of skills, keeping the canonical form.
 */
export function deduplicateSkills(skills: string[]): string[] {
  const seen = new Map<string, string>()
  for (const skill of skills) {
    const canonical = normalizeSkill(skill)
    const key = canonical.toLowerCase()
    if (!seen.has(key)) {
      seen.set(key, canonical)
    }
  }
  return Array.from(seen.values())
}
