export interface Dictionary {
  navigation: {
    home: string;
    compareTwoColumns: string;
    posts: string;
    admin: string;
    login: string;
    logout: string;
  };
  home: {
    title: string;
    subtitle: string;
    description: string;
    tagline1: string;
    tagline2: string;
    tagline3: string;
    tagline4: string;
    moreArticles: string;
  };
  keyFeatures: {
    title: string;
    freeNoInstall: {
      title: string;
      description: string;
    };
    privateSecure: {
      title: string;
      description: string;
    };
    universalFormat: {
      title: string;
      description: string;
    };
    syncScrolling: {
      title: string;
      description: string;
    };
    instantHighlight: {
      title: string;
      description: string;
    };
    highPerformance: {
      title: string;
      description: string;
    };
  };
  faq: {
    title: string;
    subtitle: string;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
  articles: {
    title: string;
    noCategory: string;
  };
  admin: {
    dashboard: string;
    manageArticles: string;
    name: string;
    description: string;
    url: string;
    category: string;
    actions: string;
    edit: string;
    save: string;
    addNew: string;
    createArticle: string;
    editArticle: string;
    articleTitle: string;
    articleDescription: string;
    articleSlug: string;
    articleContent: string;
    categoryOptional: string;
    creating: string;
    create: string;
    loading: string;
    savingArticle: string;
  };
  login: {
    title: string;
    username: string;
    password: string;
    enterUsername: string;
    enterPassword: string;
    signIn: string;
    signingIn: string;
  };
  excelUpload: {
    title: string;
    subtitle: string;
    dropZone: {
      dragText: string;
      clickText: string;
      uploading: string;
      supportedFormats: string;
      maxSize: string;
    };
    preview: {
      sheetSelector: string;
      reupload: string;
      loading: string;
      emptyWorksheet: string;
      emptyWorksheetMessage: string;
      emptyWorksheetTryOther: string;
      noData: string;
      noDataMessage: string;
      dataTruncated: string;
      rows: string;
      columns: string;
    };
    error: {
      invalidFormat: string;
      fileTooLarge: string;
      parseError: string;
      reselectFile: string;
      uploadFailed: string;
    };
    findDifferenceButton: string;
    differenceResults: string;
    backToPreview: string;
    originalFile: string;
    modifiedFile: string;
    statistics: string;
    unchanged: string;
    modified: string;
    added: string;
    deleted: string;
    totalRows: string;
    differenceRate: string;
    calculating: string;
  };
  language: {
    select: string;
    suggestion: {
      message: string;
      switch: string;
      dismiss: string;
    };
  };
  reviews: {
    title: string;
    subtitle: string;
  };
  compareTwoColumns: {
    hero: {
      title: string;
      subtitle: string;
    };
    howToCompare: {
      title: string;
      subtitle: string;
      description: string;
      steps: {
        upload: {
          title: string;
          description: string;
        };
        selectColumns: {
          title: string;
          description: string;
        };
        chooseView: {
          title: string;
          description: string;
        };
      };
      carousel: {
        descriptions: {
          instantPreview: string;
          visualComparison: string;
          focusOnDifferences: string;
          findMatches: string;
        };
      };
    };
    scenarios: {
      title: string;
      subtitle: string;
      emailMarketing: {
        title: string;
        content: string;
      };
      eventTracking: {
        title: string;
        content: string;
      };
      financialReconciliation: {
        title: string;
        content: string;
      };
    };
    faq: {
      title: string;
      subtitle: string;
      questions: Array<{
        question: string;
        answer: string;
      }>;
    };
  };
  footer: {
    description: string;
    quickLinks: string;
    connect: string;
    home: string;
    articles: string;
    github: string;
    privacyPolicy: string;
    termsOfService: string;
    copyright: string;
  };
}

export interface FAQTwoColumnsProps {
  dictionary: Dictionary;
}