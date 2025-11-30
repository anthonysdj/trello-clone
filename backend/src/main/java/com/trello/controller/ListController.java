package com.trello.controller;

import com.trello.dto.CreateListRequest;
import com.trello.model.Board;
import com.trello.model.TrelloList;
import com.trello.repository.BoardRepository;
import com.trello.repository.ListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lists")
public class ListController {

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private BoardRepository boardRepository;

    @PostMapping
    public ResponseEntity<TrelloList> createList(@RequestBody CreateListRequest request) {
        return boardRepository.findById(request.getBoardId())
                .map(board -> {
                    TrelloList list = new TrelloList();
                    list.setTitle(request.getTitle());
                    list.setPosition(request.getPosition());
                    list.setBoard(board);
                    return ResponseEntity.ok(listRepository.save(list));
                })
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrelloList> updateList(@PathVariable Long id, @RequestBody TrelloList listDetails) {
        return listRepository.findById(id)
                .map(list -> {
                    list.setTitle(listDetails.getTitle());
                    if (listDetails.getPosition() != null) {
                        list.setPosition(listDetails.getPosition());
                    }
                    return ResponseEntity.ok(listRepository.save(list));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        if (listRepository.existsById(id)) {
            listRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
