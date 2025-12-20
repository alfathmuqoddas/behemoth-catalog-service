"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createSchema("movie_service");
    await queryInterface.createTable(
      "movies",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        imdbId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
        year: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        rated: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        released: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        runtime: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        genre: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        director: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        writer: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        actors: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        plot: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        poster: {
          type: Sequelize.STRING(1000),
          allowNull: false,
        },
        imdbRating: {
          type: Sequelize.DECIMAL(3, 1),
          allowNull: true,
        },
        boxOffice: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        schema: "movie_service",
      }
    );
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable({
      tableName: "movies",
      schema: "movie_service",
    });
  },
};
