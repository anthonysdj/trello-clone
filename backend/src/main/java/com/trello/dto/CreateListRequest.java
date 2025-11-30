package com.trello.dto;

public class CreateListRequest {
    private String title;
    private Integer position;
    private Long boardId;

    public CreateListRequest() {
    }

    public CreateListRequest(String title, Integer position, Long boardId) {
        this.title = title;
        this.position = position;
        this.boardId = boardId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Long getBoardId() {
        return boardId;
    }

    public void setBoardId(Long boardId) {
        this.boardId = boardId;
    }
}
