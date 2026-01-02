<?php
namespace App\Model;

use App\Service\Config;

class Film
{
    private ?int $id = null;
    private ?string $title = null;
    private ?string $description = null;
    private ?int $duration = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): Film
    {
        $this->id = $id;
        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): Film
    {
        $this->title = $title;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): Film
    {
        $this->description = $description;
        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(?int $duration): Film
    {
        $this->duration = $duration;
        return $this;
    }

    public static function fromArray(array $array): Film
    {
        $film = new self();
        $film->fill($array);
        return $film;
    }

    public function fill(array $array): Film
    {
        if (isset($array['id']) && !$this->getId()) {
            $this->setId($array['id']);
        }
        if (isset($array['title'])) {
            $this->setTitle($array['title']);
        }
        if (isset($array['description'])) {
            $this->setDescription($array['description']);
        }
        if (isset($array['duration'])) {
            $this->setDuration($array['duration']);
        }
        return $this;
    }

    public static function findAll(): array
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM films';
        $statement = $pdo->prepare($sql);
        $statement->execute();

        $films = [];
        $result = $statement->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($result as $row) {
            $films[] = self::fromArray($row);
        }
        return $films;
    }

    public static function find($id): ?Film
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM films WHERE id = :id';
        $statement = $pdo->prepare($sql);
        $statement->execute(['id' => $id]);

        $row = $statement->fetch(\PDO::FETCH_ASSOC);
        return $row ? self::fromArray($row) : null;
    }

    public function save(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        if (!$this->getId()) {
            $sql = 'INSERT INTO films (title, description, duration) VALUES (:title, :description, :duration)';
            $statement = $pdo->prepare($sql);
            $statement->execute([
                'title' => $this->getTitle(),
                'description' => $this->getDescription(),
                'duration' => $this->getDuration(),
            ]);
            $this->setId($pdo->lastInsertId());
        } else {
            $sql = 'UPDATE films SET title = :title, description = :description, duration = :duration WHERE id = :id';
            $statement = $pdo->prepare($sql);
            $statement->execute([
                'title' => $this->getTitle(),
                'description' => $this->getDescription(),
                'duration' => $this->getDuration(),
                'id' => $this->getId(),
            ]);
        }
    }


    public function delete(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'DELETE FROM films WHERE id = :id';
        $statement = $pdo->prepare($sql);
        $statement->execute(['id' => $this->getId()]);

        $this->setId(null);
        $this->setTitle(null);
        $this->setDescription(null);
        $this->setDuration(null);
    }
}