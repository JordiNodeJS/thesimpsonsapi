import { Comment } from "@/core/domain/entities";
import {
  CharacterRepository,
  CommentRepository,
} from "@/core/application/ports/repositories";
import { NotFoundException } from "@/core/domain/exceptions";

/**
 * Input DTO for PostCommentUseCase
 */
export interface PostCommentInput {
  characterId: number;
  content: string;
}

/**
 * Output DTO for PostCommentUseCase
 */
export interface PostCommentOutput {
  success: boolean;
  comment: {
    id: number;
    content: string;
    username: string;
    createdAt: Date | null;
  };
}

/**
 * Use Case: Post Comment on Character
 * Allows authenticated users to comment on characters
 */
export class PostCommentUseCase {
  constructor(
    private characterRepository: CharacterRepository,
    private commentRepository: CommentRepository,
  ) {}

  async execute(
    input: PostCommentInput,
    userId: string,
    username: string,
  ): Promise<PostCommentOutput> {
    // 1. Validate character exists
    const character = await this.characterRepository.findById(
      input.characterId,
    );
    if (!character) {
      throw new NotFoundException("Character", input.characterId);
    }

    // 2. Create comment entity (validates content length)
    const comment = Comment.createNew(
      userId,
      input.characterId,
      input.content,
      username,
    );

    // 3. Persist comment
    const savedComment = await this.commentRepository.create(comment);

    // 4. Return result
    return {
      success: true,
      comment: {
        id: savedComment.id,
        content: savedComment.content,
        username: savedComment.username,
        createdAt: savedComment.createdAt,
      },
    };
  }
}
