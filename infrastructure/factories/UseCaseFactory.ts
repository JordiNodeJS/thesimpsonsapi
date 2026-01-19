// Import Use Cases
import {
  TrackEpisodeUseCase,
  GetEpisodeDetailsUseCase,
  ListEpisodesUseCase,
  ToggleFollowUseCase,
  PostCommentUseCase,
  GetCharacterDetailsUseCase,
  ListCharactersUseCase,
  CreateDiaryEntryUseCase,
  DeleteDiaryEntryUseCase,
  ListDiaryEntriesUseCase,
  CreateCollectionUseCase,
  AddQuoteUseCase,
  ListCollectionsUseCase,
  GetCollectionQuotesUseCase,
  SubmitTriviaUseCase,
  ListTriviaUseCase,
} from "@/core/application/use-cases";

// Import Repository Implementations
import {
  PrismaCharacterRepository,
  PrismaEpisodeRepository,
  PrismaCommentRepository,
  PrismaFollowRepository,
  PrismaDiaryRepository,
  PrismaLocationRepository,
  PrismaCollectionRepository,
  PrismaTriviaRepository,
} from "@/infrastructure/prisma/repositories";

/**
 * Use Case Factory
 * Provides dependency injection for use cases
 * This is the composition root for the application
 */
export class UseCaseFactory {
  // Singleton repositories
  private static characterRepo = new PrismaCharacterRepository();
  private static episodeRepo = new PrismaEpisodeRepository();
  private static commentRepo = new PrismaCommentRepository();
  private static followRepo = new PrismaFollowRepository();
  private static diaryRepo = new PrismaDiaryRepository();
  private static locationRepo = new PrismaLocationRepository();
  private static collectionRepo = new PrismaCollectionRepository();
  private static triviaRepo = new PrismaTriviaRepository();

  // Episode Use Cases
  static createTrackEpisodeUseCase(): TrackEpisodeUseCase {
    return new TrackEpisodeUseCase(this.episodeRepo);
  }

  static createGetEpisodeDetailsUseCase(): GetEpisodeDetailsUseCase {
    return new GetEpisodeDetailsUseCase(this.episodeRepo);
  }

  static createListEpisodesUseCase(): ListEpisodesUseCase {
    return new ListEpisodesUseCase(this.episodeRepo);
  }

  // Character Use Cases
  static createToggleFollowUseCase(): ToggleFollowUseCase {
    return new ToggleFollowUseCase(this.characterRepo, this.followRepo);
  }

  static createPostCommentUseCase(): PostCommentUseCase {
    return new PostCommentUseCase(this.characterRepo, this.commentRepo);
  }

  static createGetCharacterDetailsUseCase(): GetCharacterDetailsUseCase {
    return new GetCharacterDetailsUseCase(
      this.characterRepo,
      this.commentRepo,
      this.followRepo
    );
  }

  static createListCharactersUseCase(): ListCharactersUseCase {
    return new ListCharactersUseCase(this.characterRepo);
  }

  // Diary Use Cases
  static createCreateDiaryEntryUseCase(): CreateDiaryEntryUseCase {
    return new CreateDiaryEntryUseCase(
      this.diaryRepo,
      this.characterRepo,
      this.locationRepo
    );
  }

  static createDeleteDiaryEntryUseCase(): DeleteDiaryEntryUseCase {
    return new DeleteDiaryEntryUseCase(this.diaryRepo);
  }

  static createListDiaryEntriesUseCase(): ListDiaryEntriesUseCase {
    return new ListDiaryEntriesUseCase(this.diaryRepo);
  }

  // Collection Use Cases
  static createCreateCollectionUseCase(): CreateCollectionUseCase {
    return new CreateCollectionUseCase(this.collectionRepo);
  }

  static createAddQuoteUseCase(): AddQuoteUseCase {
    return new AddQuoteUseCase(this.collectionRepo);
  }

  static createListCollectionsUseCase(): ListCollectionsUseCase {
    return new ListCollectionsUseCase(this.collectionRepo);
  }

  static createGetCollectionQuotesUseCase(): GetCollectionQuotesUseCase {
    return new GetCollectionQuotesUseCase(this.collectionRepo);
  }

  // Trivia Use Cases
  static createSubmitTriviaUseCase(): SubmitTriviaUseCase {
    return new SubmitTriviaUseCase(
      this.triviaRepo,
      this.characterRepo,
      this.episodeRepo
    );
  }

  static createListTriviaUseCase(): ListTriviaUseCase {
    return new ListTriviaUseCase(this.triviaRepo);
  }

  // Repository accessors for special cases
  static getCharacterRepository() {
    return this.characterRepo;
  }

  static getEpisodeRepository() {
    return this.episodeRepo;
  }

  static getLocationRepository() {
    return this.locationRepo;
  }
}
