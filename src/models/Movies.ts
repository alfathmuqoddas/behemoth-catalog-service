import { DataTypes, Model, Optional, UUIDV4 } from "sequelize";
import sequelize from "../config/database";

interface MovieAttributes {
  id: string;
  title: string;
  imdbId: string;
  year: number;
  rated?: string;
  released: string;
  runtime?: string;
  genre?: string;
  director?: string;
  writer?: string;
  actors?: string;
  plot: string;
  poster: string;
  imdbRating?: number;
  boxOffice?: string;
}

interface MovieCreationAttributes extends Optional<MovieAttributes, "id"> {}

class Movie
  extends Model<MovieAttributes, MovieCreationAttributes>
  implements MovieAttributes
{
  public id!: string;
  public title!: string;
  public year!: number;
  public imdbId!: string;
  public rated!: string;
  public released!: string;
  public runtime!: string;
  public genre!: string;
  public director!: string;
  public writer!: string;
  public actors!: string;
  public plot!: string;
  public poster!: string;
  public imdbRating!: number;
  public boxOffice!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Movie.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    imdbId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(500), // Movies can have long titles
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rated: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    released: {
      type: DataTypes.STRING, // Use DataTypes.DATEONLY if format is YYYY-MM-DD
      allowNull: false,
    },
    runtime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    genre: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    director: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    writer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    actors: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plot: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    poster: {
      type: DataTypes.STRING(1000), // URLs can be very long
      allowNull: false,
    },
    imdbRating: {
      type: DataTypes.DECIMAL(3, 1), // Allows ratings like 8.5
      allowNull: true,
    },
    boxOffice: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Movie",
    tableName: "movies",
    schema: "movie_service",
    timestamps: true,
  }
);

export default Movie;
