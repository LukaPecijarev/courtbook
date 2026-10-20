package com.example.backend.service.application;

import com.example.backend.dto.SportResponse;
import java.util.List;

public interface SportApplicationService {

    List<SportResponse> listSports();
}
