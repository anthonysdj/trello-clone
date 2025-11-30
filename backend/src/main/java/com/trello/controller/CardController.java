package com.trello.controller;

import com.trello.dto.CreateCardRequest;
import com.trello.dto.UpdateCardRequest;
import com.trello.model.Card;
import com.trello.model.TrelloList;
import com.trello.repository.CardRepository;
import com.trello.repository.ListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private ListRepository listRepository;

    @PostMapping
    public ResponseEntity<Card> createCard(@RequestBody CreateCardRequest request) {
        return listRepository.findById(request.getListId())
                .map(list -> {
                    Card card = new Card();
                    card.setTitle(request.getTitle());
                    card.setDescription(request.getDescription());
                    card.setPosition(request.getPosition());
                    card.setList(list);
                    return ResponseEntity.ok(cardRepository.save(card));
                })
                .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Card> updateCard(@PathVariable Long id, @RequestBody UpdateCardRequest request) {
        return cardRepository.findById(id)
                .map(card -> {
                    if (request.getTitle() != null) {
                        card.setTitle(request.getTitle());
                    }
                    if (request.getDescription() != null) {
                        card.setDescription(request.getDescription());
                    }

                    // Handle move
                    if (request.getPosition() != null || request.getListId() != null) {
                        TrelloList oldList = card.getList();
                        Integer oldPosition = card.getPosition();

                        TrelloList newList = request.getListId() != null
                                ? listRepository.findById(request.getListId()).orElse(oldList)
                                : oldList;
                        Integer newPosition = request.getPosition() != null
                                ? request.getPosition()
                                : oldPosition;

                        if (oldList.getId().equals(newList.getId())) {
                            // Same list move
                            if (!oldPosition.equals(newPosition)) {
                                java.util.List<Card> cards = cardRepository
                                        .findByListIdOrderByPositionAsc(oldList.getId());

                                for (Card c : cards) {
                                    if (c.getId().equals(card.getId()))
                                        continue;

                                    if (oldPosition < newPosition) {
                                        // Moving down: shift cards between old and new positions UP
                                        if (c.getPosition() > oldPosition && c.getPosition() <= newPosition) {
                                            c.setPosition(c.getPosition() - 1);
                                            cardRepository.save(c);
                                        }
                                    } else {
                                        // Moving up: shift cards between new and old positions DOWN
                                        if (c.getPosition() >= newPosition && c.getPosition() < oldPosition) {
                                            c.setPosition(c.getPosition() + 1);
                                            cardRepository.save(c);
                                        }
                                    }
                                }
                                card.setPosition(newPosition);
                            }
                        } else {
                            // Different list move
                            // 1. Shift items in old list > oldPosition UP (decrement)
                            java.util.List<Card> oldListCards = cardRepository
                                    .findByListIdOrderByPositionAsc(oldList.getId());
                            for (Card c : oldListCards) {
                                if (c.getId().equals(card.getId()))
                                    continue;
                                if (c.getPosition() > oldPosition) {
                                    c.setPosition(c.getPosition() - 1);
                                    cardRepository.save(c);
                                }
                            }

                            // 2. Shift items in new list >= newPosition DOWN (increment)
                            java.util.List<Card> newListCards = cardRepository
                                    .findByListIdOrderByPositionAsc(newList.getId());
                            for (Card c : newListCards) {
                                if (c.getPosition() >= newPosition) {
                                    c.setPosition(c.getPosition() + 1);
                                    cardRepository.save(c);
                                }
                            }

                            card.setList(newList);
                            card.setPosition(newPosition);
                        }
                    }

                    return ResponseEntity.ok(cardRepository.save(card));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        if (cardRepository.existsById(id)) {
            cardRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
