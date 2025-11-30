package com.trello;

import com.trello.model.Board;
import com.trello.model.Card;
import com.trello.model.TrelloList;
import com.trello.repository.BoardRepository;
import com.trello.repository.CardRepository;
import com.trello.repository.ListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private ListRepository listRepository;

    @Autowired
    private CardRepository cardRepository;

    @Override
    public void run(String... args) {
        // Create a demo board
        Board board = new Board();
        board.setName("My Trello Board");
        board = boardRepository.save(board);

        // Create demo lists
        TrelloList todoList = new TrelloList();
        todoList.setTitle("To Do");
        todoList.setPosition(0);
        todoList.setBoard(board);
        todoList = listRepository.save(todoList);

        TrelloList inProgressList = new TrelloList();
        inProgressList.setTitle("In Progress");
        inProgressList.setPosition(1);
        inProgressList.setBoard(board);
        inProgressList = listRepository.save(inProgressList);

        TrelloList doneList = new TrelloList();
        doneList.setTitle("Done");
        doneList.setPosition(2);
        doneList.setBoard(board);
        doneList = listRepository.save(doneList);

        // Create demo cards in To Do
        Card card1 = new Card();
        card1.setTitle("Design the database schema");
        card1.setDescription("Create ERD and define all entities");
        card1.setPosition(0);
        card1.setList(todoList);
        cardRepository.save(card1);

        Card card2 = new Card();
        card2.setTitle("Set up Spring Boot project");
        card2.setDescription("Initialize project with Maven and dependencies");
        card2.setPosition(1);
        card2.setList(todoList);
        cardRepository.save(card2);

        // Create demo cards in In Progress
        Card card3 = new Card();
        card3.setTitle("Implement REST API");
        card3.setDescription("Create controllers for boards, lists, and cards");
        card3.setPosition(0);
        card3.setList(inProgressList);
        cardRepository.save(card3);

        // Create demo cards in Done
        Card card4 = new Card();
        card4.setTitle("Project planning");
        card4.setDescription("Define requirements and architecture");
        card4.setPosition(0);
        card4.setList(doneList);
        cardRepository.save(card4);

        System.out.println("Demo data initialized successfully!");
    }
}
