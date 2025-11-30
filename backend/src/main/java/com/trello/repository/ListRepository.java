package com.trello.repository;

import com.trello.model.TrelloList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListRepository extends JpaRepository<TrelloList, Long> {
    List<TrelloList> findByBoardIdOrderByPositionAsc(Long boardId);
}
